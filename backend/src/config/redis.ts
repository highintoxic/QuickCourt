import Redis from "ioredis";
import { env } from "./env.js";

// Redis connection configuration
const redisConfig = {
	host: env.redis.host,
	port: env.redis.port,
	password: env.redis.password,
	db: env.redis.db,
	retryDelayOnFailover: 100,
	retryDelayOnClusterDown: 300,
	maxRetriesPerRequest: 3,
	lazyConnect: true,
	keepAlive: 30000,
	connectTimeout: 10000,
	commandTimeout: 5000,
};

// Create Redis client instance
export const redis = new Redis(redisConfig);

// Connection event handlers
redis.on("connect", () => {
	console.log("✅ Redis connected successfully");
});

redis.on("error", (error) => {
	console.error("❌ Redis connection error:", error);
});

redis.on("reconnecting", () => {
	console.log("🔄 Redis reconnecting...");
});

redis.on("close", () => {
	console.log("🔌 Redis connection closed");
});

// Redis utility functions for booking conflicts
export class BookingConflictCache {
	private static readonly LOCK_PREFIX = "booking_lock:";
	private static readonly CONFLICT_PREFIX = "booking_conflict:";
	private static readonly LOCK_TIMEOUT = 30; // 30 seconds
	private static readonly CONFLICT_TTL = 300; // 5 minutes

	/**
	 * Generate a unique key for court booking time slot
	 */
	private static generateSlotKey(
		courtId: string,
		startTime: Date,
		endTime: Date
	): string {
		const start = startTime.toISOString();
		const end = endTime.toISOString();
		return `${courtId}:${start}:${end}`;
	}

	/**
	 * Generate overlapping time slot keys for conflict checking
	 */
	private static generateOverlapKeys(
		courtId: string,
		startTime: Date,
		endTime: Date
	): string[] {
		const keys: string[] = [];
		const slotDuration = 30 * 60 * 1000; // 30 minutes in milliseconds

		// Generate keys for 30-minute slots that overlap with the requested time
		const requestStart = startTime.getTime();
		const requestEnd = endTime.getTime();

		// Start from 2 hours before to 2 hours after to catch overlapping bookings
		const checkStart = requestStart - 2 * 60 * 60 * 1000;
		const checkEnd = requestEnd + 2 * 60 * 60 * 1000;

		for (let time = checkStart; time < checkEnd; time += slotDuration) {
			const slotStart = new Date(time);
			const slotEnd = new Date(time + slotDuration);

			// Check if this slot overlaps with our requested time
			if (
				slotStart.getTime() < requestEnd &&
				slotEnd.getTime() > requestStart
			) {
				keys.push(
					`${this.CONFLICT_PREFIX}${courtId}:${slotStart.toISOString()}`
				);
			}
		}

		return keys;
	}

	/**
	 * Acquire a distributed lock for booking creation
	 */
	static async acquireLock(
		courtId: string,
		startTime: Date,
		endTime: Date
	): Promise<string | null> {
		const lockKey = `${this.LOCK_PREFIX}${this.generateSlotKey(
			courtId,
			startTime,
			endTime
		)}`;
		const lockValue = `${Date.now()}-${Math.random()}`;

		try {
			const result = await redis.set(
				lockKey,
				lockValue,
				"EX",
				this.LOCK_TIMEOUT,
				"NX"
			);

			return result === "OK" ? lockValue : null;
		} catch (error) {
			console.error("Error acquiring booking lock:", error);
			return null;
		}
	}

	/**
	 * Release a distributed lock
	 */
	static async releaseLock(
		courtId: string,
		startTime: Date,
		endTime: Date,
		lockValue: string
	): Promise<boolean> {
		const lockKey = `${this.LOCK_PREFIX}${this.generateSlotKey(
			courtId,
			startTime,
			endTime
		)}`;

		const luaScript = `
      if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
      else
        return 0
      end
    `;

		try {
			const result = (await redis.eval(
				luaScript,
				1,
				lockKey,
				lockValue
			)) as number;
			return result === 1;
		} catch (error) {
			console.error("Error releasing booking lock:", error);
			return false;
		}
	}

	/**
	 * Check for booking conflicts using Redis cache
	 */
	static async checkConflict(
		courtId: string,
		startTime: Date,
		endTime: Date
	): Promise<boolean> {
		const conflictKeys = this.generateOverlapKeys(courtId, startTime, endTime);

		try {
			if (conflictKeys.length === 0) {
				return false;
			}

			const pipeline = redis.pipeline();
			conflictKeys.forEach((key) => pipeline.exists(key));
			const results = await pipeline.exec();

			if (!results) {
				return false;
			}

			// Check if any conflict key exists
			return results.some((result) => result && result[1] === 1);
		} catch (error) {
			console.error("Error checking booking conflict in Redis:", error);
			// Fallback to database check if Redis fails
			return false;
		}
	}

	/**
	 * Cache a booking conflict to prevent double bookings
	 */
	static async cacheBooking(
		courtId: string,
		startTime: Date,
		endTime: Date,
		bookingId: string
	): Promise<boolean> {
		const conflictKeys = this.generateOverlapKeys(courtId, startTime, endTime);

		try {
			const pipeline = redis.pipeline();
			conflictKeys.forEach((key) => {
				pipeline.setex(key, this.CONFLICT_TTL, bookingId);
			});

			const results = await pipeline.exec();
			return results !== null && results.length > 0;
		} catch (error) {
			console.error("Error caching booking conflict:", error);
			return false;
		}
	}

	/**
	 * Remove booking from conflict cache (when booking is cancelled)
	 */
	static async removeBooking(
		courtId: string,
		startTime: Date,
		endTime: Date
	): Promise<boolean> {
		const conflictKeys = this.generateOverlapKeys(courtId, startTime, endTime);

		try {
			if (conflictKeys.length === 0) {
				return true;
			}

			const result = await redis.del(...conflictKeys);
			return result > 0;
		} catch (error) {
			console.error("Error removing booking from cache:", error);
			return false;
		}
	}

	/**
	 * Get all cached bookings for a court on a specific date
	 */
	static async getCourtBookings(
		courtId: string,
		date: Date
	): Promise<string[]> {
		const dayStart = new Date(date);
		dayStart.setHours(0, 0, 0, 0);
		const dayEnd = new Date(date);
		dayEnd.setHours(23, 59, 59, 999);

		const pattern = `${this.CONFLICT_PREFIX}${courtId}:*`;

		try {
			const keys = await redis.keys(pattern);
			const pipeline = redis.pipeline();
			keys.forEach((key) => pipeline.get(key));
			const results = await pipeline.exec();

			if (!results) {
				return [];
			}

			return results
				.map((result) => result && (result[1] as string))
				.filter(Boolean);
		} catch (error) {
			console.error("Error getting court bookings from cache:", error);
			return [];
		}
	}

	/**
	 * Flush all booking conflict data (for testing/debugging)
	 */
	static async flushBookingData(): Promise<boolean> {
		try {
			const lockKeys = await redis.keys(`${this.LOCK_PREFIX}*`);
			const conflictKeys = await redis.keys(`${this.CONFLICT_PREFIX}*`);
			const allKeys = [...lockKeys, ...conflictKeys];

			if (allKeys.length > 0) {
				await redis.del(...allKeys);
			}

			return true;
		} catch (error) {
			console.error("Error flushing booking data:", error);
			return false;
		}
	}
}

// Initialize Redis connection
export const initializeRedis = async (): Promise<boolean> => {
	try {
		await redis.connect();
		console.log("🔗 Redis initialized successfully");
		return true;
	} catch (error) {
		console.error("❌ Failed to initialize Redis:", error);
		return false;
	}
};

// Graceful shutdown
export const closeRedis = async (): Promise<void> => {
	try {
		await redis.quit();
		console.log("👋 Redis connection closed gracefully");
	} catch (error) {
		console.error("Error closing Redis connection:", error);
	}
};

export default redis;

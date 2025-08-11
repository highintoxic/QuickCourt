import { prisma } from "../config/prisma.js";
import { BookingConflictCache, redis } from "../config/redis.js";
import { BookingStatus } from "@prisma/client";

export interface BookingCreateData {
	userId: string;
	courtId: string;
	startTime: Date;
	endTime: Date;
}

export interface BookingConflictResult {
	hasConflict: boolean;
	conflictingBookings?: {
		id: string;
		startsAt: Date;
		endsAt: Date;
		status: BookingStatus;
	}[];
	message?: string;
}

export class EnhancedBookingService {
	/**
	 * Check for booking conflicts using Redis cache first, then database fallback
	 */
	static async checkBookingConflicts(
		courtId: string,
		startTime: Date,
		endTime: Date,
		excludeBookingId?: string
	): Promise<BookingConflictResult> {
		try {
			// First check Redis cache for fast conflict detection
			const hasRedisConflict = await BookingConflictCache.checkConflict(
				courtId,
				startTime,
				endTime
			);

			if (hasRedisConflict) {
				return {
					hasConflict: true,
					message: "Time slot conflict detected in cache",
				};
			}

			// Fallback to database check for accuracy
			const whereClause: any = {
				courtId,
				status: { in: ["PENDING", "CONFIRMED"] as BookingStatus[] },
				OR: [
					{
						AND: [
							{ startsAt: { lte: startTime } },
							{ endsAt: { gt: startTime } },
						],
					},
					{
						AND: [{ startsAt: { lt: endTime } }, { endsAt: { gte: endTime } }],
					},
					{
						AND: [
							{ startsAt: { gte: startTime } },
							{ endsAt: { lte: endTime } },
						],
					},
				],
			};

			// Exclude specific booking if provided (for updates)
			if (excludeBookingId) {
				whereClause.id = { not: excludeBookingId };
			}

			const conflictingBookings = await prisma.booking.findMany({
				where: whereClause,
				select: {
					id: true,
					startsAt: true,
					endsAt: true,
					status: true,
				},
			});

			const hasConflict = conflictingBookings.length > 0;

			// If no conflict in database but Redis showed conflict, clean up Redis cache
			if (!hasConflict && hasRedisConflict) {
				await BookingConflictCache.removeBooking(courtId, startTime, endTime);
			}

			return {
				hasConflict,
				conflictingBookings: hasConflict ? conflictingBookings : undefined,
				message: hasConflict
					? "Time slot conflicts with existing bookings"
					: "No conflicts found",
			};
		} catch (error) {
			console.error("Error checking booking conflicts:", error);
			// In case of error, assume conflict to be safe
			return {
				hasConflict: true,
				message: "Error checking conflicts - please try again",
			};
		}
	}

	/**
	 * Create a booking with distributed locking to prevent race conditions
	 */
	static async createBookingWithLock(bookingData: BookingCreateData) {
		const { courtId, startTime, endTime, userId } = bookingData;

		// Step 1: Acquire distributed lock
		const lockValue = await BookingConflictCache.acquireLock(
			courtId,
			startTime,
			endTime
		);

		if (!lockValue) {
			throw new Error(
				"Unable to acquire booking lock - another booking in progress"
			);
		}

		try {
			// Step 2: Check for conflicts within the lock
			const conflictCheck = await this.checkBookingConflicts(
				courtId,
				startTime,
				endTime
			);

			if (conflictCheck.hasConflict) {
				throw new Error(conflictCheck.message || "Time slot conflict detected");
			}

			// Step 3: Get court information for pricing
			const court = await prisma.court.findUnique({
				where: { id: courtId },
				include: { facility: true },
			});

			if (!court || !court.isActive) {
				throw new Error("Court not found or inactive");
			}

			// Step 4: Calculate booking details
			const durationHours =
				(endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
			const totalAmount = durationHours * Number(court.pricePerHour);

			// Step 5: Create booking in database
			const booking = await prisma.booking.create({
				data: {
					userId,
					courtId,
					startsAt: startTime,
					endsAt: endTime,
					hours: durationHours,
					unitPrice: court.pricePerHour,
					totalAmount,
					status: "PENDING" as BookingStatus,
				},
				include: {
					court: {
						include: { facility: true },
					},
					user: {
						select: { id: true, email: true, fullName: true },
					},
				},
			});

			// Step 6: Cache the booking in Redis to prevent future conflicts
			await BookingConflictCache.cacheBooking(
				courtId,
				startTime,
				endTime,
				booking.id
			);

			// Step 7: Release the lock
			await BookingConflictCache.releaseLock(
				courtId,
				startTime,
				endTime,
				lockValue
			);

			return booking;
		} catch (error) {
			// Always release lock in case of error
			await BookingConflictCache.releaseLock(
				courtId,
				startTime,
				endTime,
				lockValue
			);
			throw error;
		}
	}

	/**
	 * Cancel a booking and update Redis cache
	 */
	static async cancelBooking(bookingId: string, userId: string) {
		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
			include: {
				court: {
					include: { facility: true },
				},
			},
		});

		if (!booking) {
			throw new Error("Booking not found");
		}

		if (booking.userId !== userId) {
			throw new Error("Not authorized to cancel this booking");
		}

		if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
			throw new Error("Cannot cancel this booking");
		}

		// Check if booking is too close to start time
		const hoursUntilBooking =
			(booking.startsAt.getTime() - Date.now()) / (1000 * 60 * 60);
		if (hoursUntilBooking < 2) {
			throw new Error(
				"Cannot cancel booking less than 2 hours before start time"
			);
		}

		// Update booking status
		const updatedBooking = await prisma.booking.update({
			where: { id: bookingId },
			data: {
				status: "CANCELLED" as BookingStatus,
				updatedAt: new Date(),
			},
			include: {
				court: {
					include: { facility: true },
				},
				user: {
					select: { id: true, email: true, fullName: true },
				},
			},
		});

		// Remove from Redis cache to allow new bookings
		await BookingConflictCache.removeBooking(
			booking.courtId,
			booking.startsAt,
			booking.endsAt
		);

		return updatedBooking;
	}

	/**
	 * Update booking status and manage cache accordingly
	 */
	static async updateBookingStatus(
		bookingId: string,
		newStatus: BookingStatus,
		updatedBy: string,
		userRole: string
	) {
		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
			include: {
				court: {
					include: { facility: true },
				},
			},
		});

		if (!booking) {
			throw new Error("Booking not found");
		}

		// Check permission
		const canUpdate =
			userRole === "ADMIN" ||
			(userRole === "FACILITY_OWNER" &&
				booking.court.facility.ownerId === updatedBy);

		if (!canUpdate) {
			throw new Error("Not authorized to update this booking");
		}

		const updatedBooking = await prisma.booking.update({
			where: { id: bookingId },
			data: {
				status: newStatus,
				updatedAt: new Date(),
			},
			include: {
				court: {
					include: { facility: true },
				},
				user: {
					select: { id: true, email: true, fullName: true },
				},
			},
		});

		// Update Redis cache based on status
		if (newStatus === "CANCELLED") {
			// Remove from cache to allow new bookings
			await BookingConflictCache.removeBooking(
				booking.courtId,
				booking.startsAt,
				booking.endsAt
			);
		} else if (newStatus === "CONFIRMED") {
			// Ensure it's properly cached
			await BookingConflictCache.cacheBooking(
				booking.courtId,
				booking.startsAt,
				booking.endsAt,
				booking.id
			);
		}

		return updatedBooking;
	}

	/**
	 * Get available time slots for a court on a specific date
	 */
	static async getAvailableSlots(
		courtId: string,
		date: Date,
		duration: number = 1
	) {
		const dayStart = new Date(date);
		dayStart.setHours(6, 0, 0, 0); // Assume facilities open at 6 AM

		const dayEnd = new Date(date);
		dayEnd.setHours(22, 0, 0, 0); // Assume facilities close at 10 PM

		const slots: { startTime: Date; endTime: Date; available: boolean }[] = [];
		const slotDuration = duration * 60 * 60 * 1000; // Convert hours to milliseconds

		// Generate all possible slots for the day
		for (
			let time = dayStart.getTime();
			time < dayEnd.getTime() - slotDuration;
			time += 30 * 60 * 1000
		) {
			const slotStart = new Date(time);
			const slotEnd = new Date(time + slotDuration);

			// Check if this slot is available
			const conflictCheck = await this.checkBookingConflicts(
				courtId,
				slotStart,
				slotEnd
			);

			slots.push({
				startTime: slotStart,
				endTime: slotEnd,
				available: !conflictCheck.hasConflict,
			});
		}

		return slots;
	}

	/**
	 * Bulk check availability for multiple courts
	 */
	static async checkBulkAvailability(
		facilityId: string,
		date: Date,
		startTime: string,
		endTime: string
	) {
		// Get all active courts for the facility
		const courts = await prisma.court.findMany({
			where: {
				facilityId,
				isActive: true,
			},
		});

		if (courts.length === 0) {
			return [];
		}

		// Combine date and time
		const startDateTime = new Date(
			`${date.toISOString().split("T")[0]}T${startTime}:00`
		);
		const endDateTime = new Date(
			`${date.toISOString().split("T")[0]}T${endTime}:00`
		);

		// Check availability for each court in parallel
		const availabilityChecks = courts.map(async (court) => {
			const conflictCheck = await this.checkBookingConflicts(
				court.id,
				startDateTime,
				endDateTime
			);

			return {
				court,
				available: !conflictCheck.hasConflict,
				conflicts: conflictCheck.conflictingBookings || [],
			};
		});

		return await Promise.all(availabilityChecks);
	}

	/**
	 * Get booking statistics with caching
	 */
	static async getBookingStats(facilityId?: string) {
		const cacheKey = `booking_stats:${facilityId || "all"}`;

		try {
			// Try to get from cache first
			const cached = await redis.get(cacheKey);
			if (cached) {
				return JSON.parse(cached);
			}
		} catch (error) {
			console.error("Error getting cached stats:", error);
		}

		// Calculate stats from database
		const whereClause = facilityId ? { court: { facilityId } } : {};

		const [
			totalBookings,
			pendingBookings,
			confirmedBookings,
			cancelledBookings,
			completedBookings,
			thisMonthBookings,
			totalRevenue,
		] = await Promise.all([
			prisma.booking.count({ where: whereClause }),
			prisma.booking.count({ where: { ...whereClause, status: "PENDING" } }),
			prisma.booking.count({ where: { ...whereClause, status: "CONFIRMED" } }),
			prisma.booking.count({ where: { ...whereClause, status: "CANCELLED" } }),
			prisma.booking.count({ where: { ...whereClause, status: "COMPLETED" } }),
			prisma.booking.count({
				where: {
					...whereClause,
					createdAt: {
						gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
					},
				},
			}),
			prisma.booking.aggregate({
				where: { ...whereClause, status: { in: ["CONFIRMED", "COMPLETED"] } },
				_sum: { totalAmount: true },
			}),
		]);

		const stats = {
			total: totalBookings,
			byStatus: {
				PENDING: pendingBookings,
				CONFIRMED: confirmedBookings,
				CANCELLED: cancelledBookings,
				COMPLETED: completedBookings,
			},
			thisMonth: thisMonthBookings,
			totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
		};

		// Cache for 5 minutes
		try {
			await redis.setex(cacheKey, 300, JSON.stringify(stats));
		} catch (error) {
			console.error("Error caching stats:", error);
		}

		return stats;
	}
}

export default EnhancedBookingService;

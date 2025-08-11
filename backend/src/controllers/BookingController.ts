import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { prisma } from "../config/prisma";
import { EnhancedBookingService } from "../services/enhancedBookingService";

interface CreateBookingInput {
	courtId: string;
	date: string;
	startTime: string;
	endTime: string;
}

interface UpdateBookingStatusInput {
	status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

interface AvailabilityCheckInput {
	facilityId: string;
	date: string;
	startTime: string;
	endTime: string;
}

export class BookingController extends BaseController {
	// Create a new booking with Redis-based conflict management
	async createBooking(req: Request, res: Response, next: NextFunction) {
		try {
			const { courtId, date, startTime, endTime } =
				req.body as CreateBookingInput;
			const userId = req.user!.id;

			// Use enhanced service with Redis locking
			const booking = await EnhancedBookingService.createBookingWithLock({
				userId,
				courtId,
				startTime: new Date(`${date}T${startTime}:00`),
				endTime: new Date(`${date}T${endTime}:00`),
			});
			return this.success(res, booking, "Booking created successfully", 201);
		} catch (error: any) {
			if (
				error.message.includes("conflict") ||
				error.message.includes("not available")
			) {
				return this.error(res, error.message, 409);
			}
			if (error.message.includes("not found")) {
				return this.notFound(res, "Court");
			}
			if (
				error.message.includes("validate") ||
				error.message.includes("invalid")
			) {
				return this.error(res, error.message, 400);
			}
			next(error);
		}
	}

	// Get user's bookings
	async getUserBookings(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user!.id;
			const { page = 1, limit = 10, sort, order = "desc" } = req.query as any;

			const skip = (Number(page) - 1) * Number(limit);
			const orderBy = sort ? { [sort as string]: order } : { createdAt: order };

			const [bookings, total] = await Promise.all([
				prisma.booking.findMany({
					where: { userId },
					skip,
					take: Number(limit),
					orderBy,
					include: {
						court: {
							include: { facility: true },
						},
						payment: {
							select: { id: true, amount: true, status: true, createdAt: true },
						},
					},
				}),
				prisma.booking.count({
					where: { userId },
				}),
			]);

			return this.successWithPagination(res, bookings, {
				page: Number(page),
				limit: Number(limit),
				total,
				totalPages: Math.ceil(total / Number(limit)),
			});
		} catch (error) {
			next(error);
		}
	}

	// Get booking by ID
	async getBookingById(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const userId = req.user!.id;
			const userRole = req.user!.role;

			const booking = await prisma.booking.findUnique({
				where: { id },
				include: {
					court: {
						include: { facility: true },
					},
					user: {
						select: { id: true, email: true, fullName: true },
					},
					payment: {
						select: { id: true, amount: true, status: true, createdAt: true },
					},
				},
			});

			if (!booking) {
				return this.notFound(res, "Booking");
			}

			// Check access permissions
			const canAccess =
				userRole === "ADMIN" ||
				booking.userId === userId ||
				(userRole === "FACILITY_OWNER" &&
					booking.court.facility.ownerId === userId);

			if (!canAccess) {
				return this.forbidden(res);
			}

			return this.success(res, booking);
		} catch (error) {
			next(error);
		}
	}

	// Cancel booking with Redis cache management
	async cancelBooking(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const userId = req.user!.id;
			const userRole = req.user!.role;

			// Use enhanced service for cancellation with cache management
			const cancelledBooking = await EnhancedBookingService.cancelBooking(
				id,
				userId
			);
			return this.success(
				res,
				cancelledBooking,
				"Booking cancelled successfully"
			);
		} catch (error: any) {
			if (error.message.includes("not found")) {
				return this.notFound(res, "Booking");
			}
			if (error.message.includes("not authorized")) {
				return this.forbidden(res);
			}
			if (error.message.includes("Cannot cancel")) {
				return this.error(res, error.message, 400);
			}
			next(error);
		}
	}

	// Update booking status (for facility owners) with Redis cache management
	async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const { status } = req.body as UpdateBookingStatusInput;
			const userId = req.user!.id;
			const userRole = req.user!.role;

			// Use enhanced service with Redis cache management
			const updatedBooking = await EnhancedBookingService.updateBookingStatus(
				id,
				status as any,
				userId,
				userRole
			);

			return this.success(
				res,
				updatedBooking,
				"Booking status updated successfully"
			);
		} catch (error: any) {
			if (error.message.includes("not found")) {
				return this.notFound(res, "Booking");
			}
			if (error.message.includes("not authorized")) {
				return this.forbidden(res);
			}
			next(error);
		}
	}

	// Check availability for a specific time slot using enhanced service
	async checkAvailability(req: Request, res: Response, next: NextFunction) {
		try {
			const { facilityId, date, startTime, endTime } =
				req.query as unknown as AvailabilityCheckInput; // Use enhanced bulk availability check
			const availability = await EnhancedBookingService.checkBulkAvailability(
				facilityId,
				new Date(date),
				startTime,
				endTime
			);

			return this.success(res, { availability });
		} catch (error) {
			next(error);
		}
	}

	// Get facility bookings (for facility owners)
	async getFacilityBookings(req: Request, res: Response, next: NextFunction) {
		try {
			const { id: facilityId } = req.params;
			const { page = 1, limit = 10, sort, order = "desc" } = req.query as any;
			const userId = req.user!.id;
			const userRole = req.user!.role;

			// Check permission
			const facility = await prisma.facility.findUnique({
				where: { id: facilityId },
			});

			if (!facility) {
				return this.notFound(res, "Facility");
			}

			const canAccess =
				userRole === "ADMIN" ||
				(userRole === "FACILITY_OWNER" && facility.ownerId === userId);

			if (!canAccess) {
				return this.forbidden(res);
			}

			const skip = (Number(page) - 1) * Number(limit);
			const orderBy = sort ? { [sort as string]: order } : { createdAt: order };

			const [bookings, total] = await Promise.all([
				prisma.booking.findMany({
					where: {
						court: { facilityId },
					},
					skip,
					take: Number(limit),
					orderBy,
					include: {
						court: true,
						user: {
							select: { id: true, email: true, fullName: true },
						},
						payment: {
							select: { id: true, amount: true, status: true, createdAt: true },
						},
					},
				}),
				prisma.booking.count({
					where: {
						court: { facilityId },
					},
				}),
			]);

			return this.successWithPagination(res, bookings, {
				page: Number(page),
				limit: Number(limit),
				total,
				totalPages: Math.ceil(total / Number(limit)),
			});
		} catch (error) {
			next(error);
		}
	}
}

export default new BookingController();

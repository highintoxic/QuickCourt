import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";
import {
	CreateCourtInput,
	UpdateCourtInput,
	CreateCourtUnavailabilityInput,
	CourtAvailabilityQuery,
	CreateSportInput,
	PaginationQuery,
} from "../types/controller-types";

interface AuthenticatedRequest extends AuthRequest {
	user?: {
		id: string;
		email: string;
		role: string;
		isVerified: boolean;
	};
}

export class CourtController {
	/**
	 * Get all courts for a facility
	 */
	static async getCourtsByFacility(req: Request, res: Response): Promise<void> {
		try {
			const { facilityId } = req.params;
			const {
				page = 1,
				limit = 10,
				sportId,
				isActive,
			} = req.query as PaginationQuery & {
				sportId?: string;
				isActive?: string;
			};

			const pageNum = parseInt(page.toString());
			const limitNum = parseInt(limit.toString());
			const offset = (pageNum - 1) * limitNum;

			const where = {
				facilityId,
				...(sportId && { sportId }),
				...(isActive !== undefined && { isActive: isActive === "true" }),
			};

			const [courts, totalCount] = await Promise.all([
				prisma.court.findMany({
					where,
					include: {
						sport: {
							select: {
								id: true,
								name: true,
								icon: true,
							},
						},
						facility: {
							select: {
								id: true,
								name: true,
								ownerId: true,
							},
						},
						_count: {
							select: {
								bookings: true,
								unavailabilities: true,
							},
						},
					},
					orderBy: { name: "asc" },
					skip: offset,
					take: limitNum,
				}),
				prisma.court.count({ where }),
			]);

			const totalPages = Math.ceil(totalCount / limitNum);

			res.status(200).json({
				message: "Courts retrieved successfully",
				data: courts,
				pagination: {
					currentPage: pageNum,
					totalPages,
					totalItems: totalCount,
					itemsPerPage: limitNum,
				},
			});
		} catch (error) {
			console.error("Get courts by facility error:", error);
			res.status(500).json({
				message: "Failed to retrieve courts",
				error: error instanceof Error ? error.message : "Internal server error",
			});
		}
	}

	/**
	 * Get court by ID with detailed information
	 */
	static async getCourtById(req: Request, res: Response): Promise<void> {
		try {
			const { courtId } = req.params;

			const court = await prisma.court.findUnique({
				where: { id: courtId },
				include: {
					sport: {
						select: {
							id: true,
							name: true,
							icon: true,
						},
					},
					facility: {
						select: {
							id: true,
							name: true,
							ownerId: true,
							addressLine: true,
							city: true,
							state: true,
							phone: true,
							email: true,
						},
					},
					unavailabilities: {
						where: {
							endsAt: {
								gte: new Date(),
							},
						},
						orderBy: { startsAt: "asc" },
					},
					_count: {
						select: {
							bookings: true,
						},
					},
				},
			});

			if (!court) {
				res.status(404).json({ message: "Court not found" });
				return;
			}

			res.status(200).json({
				message: "Court retrieved successfully",
				data: court,
			});
		} catch (error) {
			console.error("Get court by ID error:", error);
			res.status(500).json({
				message: "Failed to retrieve court",
				error: error instanceof Error ? error.message : "Internal server error",
			});
		}
	}

	/**
	 * Create a new court (facility owners only)
	 */
	static async createCourt(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		try {
			const userId = req.user?.id || req.userId;
			if (!userId) {
				res.status(401).json({ message: "User not authenticated" });
				return;
			}

			const { facilityId } = req.params;
			const {
				name,
				sportId,
				pricePerHour,
				opensAt,
				closesAt,
				isActive = true,
			}: CreateCourtInput = req.body;

			// Validate required fields
			if (!name || !sportId || !pricePerHour || !opensAt || !closesAt) {
				res
					.status(400)
					.json({ message: "All required fields must be provided" });
				return;
			}

			// Validate time format (HH:MM)
			const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
			if (!timeRegex.test(opensAt) || !timeRegex.test(closesAt)) {
				res
					.status(400)
					.json({
						message: "Invalid time format. Use HH:MM format (e.g., 09:00)",
					});
				return;
			}

			// Validate opening hours logic
			const openTime = new Date(`1970-01-01T${opensAt}:00`);
			const closeTime = new Date(`1970-01-01T${closesAt}:00`);
			if (openTime >= closeTime) {
				res
					.status(400)
					.json({ message: "Opening time must be before closing time" });
				return;
			}

			// Verify facility ownership
			const facility = await prisma.facility.findUnique({
				where: { id: facilityId },
				select: { ownerId: true, status: true },
			});

			if (!facility) {
				res.status(404).json({ message: "Facility not found" });
				return;
			}

			if (facility.ownerId !== userId && req.user?.role !== "ADMIN") {
				res
					.status(403)
					.json({
						message:
							"Access denied. You can only create courts for your own facilities",
					});
				return;
			}

			if (facility.status !== "APPROVED") {
				res
					.status(400)
					.json({
						message:
							"Cannot create courts for facilities that are not approved",
					});
				return;
			}

			// Verify sport exists
			const sport = await prisma.sport.findUnique({
				where: { id: sportId },
			});

			if (!sport) {
				res.status(404).json({ message: "Sport not found" });
				return;
			}

			// Check for duplicate court name in the facility
			const existingCourt = await prisma.court.findFirst({
				where: {
					facilityId,
					name,
				},
			});

			if (existingCourt) {
				res
					.status(409)
					.json({
						message: "A court with this name already exists in this facility",
					});
				return;
			}

			const court = await prisma.court.create({
				data: {
					facilityId,
					name,
					sportId,
					pricePerHour,
					opensAt,
					closesAt,
					isActive,
				},
				include: {
					sport: {
						select: {
							id: true,
							name: true,
							icon: true,
						},
					},
					facility: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			res.status(201).json({
				message: "Court created successfully",
				data: court,
			});
		} catch (error) {
			console.error("Create court error:", error);
			res.status(500).json({
				message: "Failed to create court",
				error: error instanceof Error ? error.message : "Internal server error",
			});
		}
	}

	/**
	 * Update court details (facility owners only)
	 */
	static async updateCourt(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		try {
			const userId = req.user?.id || req.userId;
			if (!userId) {
				res.status(401).json({ message: "User not authenticated" });
				return;
			}

			const { courtId } = req.params;
			const {
				name,
				sportId,
				pricePerHour,
				opensAt,
				closesAt,
				isActive,
			}: UpdateCourtInput = req.body;

			// Validate at least one field is provided
			if (
				!name &&
				!sportId &&
				!pricePerHour &&
				!opensAt &&
				!closesAt &&
				isActive === undefined
			) {
				res
					.status(400)
					.json({ message: "At least one field must be provided for update" });
				return;
			}

			// Get current court with facility information
			const existingCourt = await prisma.court.findUnique({
				where: { id: courtId },
				include: {
					facility: {
						select: {
							id: true,
							ownerId: true,
							status: true,
						},
					},
				},
			});

			if (!existingCourt) {
				res.status(404).json({ message: "Court not found" });
				return;
			}

			// Verify ownership
			if (
				existingCourt.facility.ownerId !== userId &&
				req.user?.role !== "ADMIN"
			) {
				res
					.status(403)
					.json({
						message: "Access denied. You can only update your own courts",
					});
				return;
			}

			// Validate time format if provided
			if (opensAt || closesAt) {
				const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
				if (opensAt && !timeRegex.test(opensAt)) {
					res
						.status(400)
						.json({ message: "Invalid opening time format. Use HH:MM format" });
					return;
				}
				if (closesAt && !timeRegex.test(closesAt)) {
					res
						.status(400)
						.json({ message: "Invalid closing time format. Use HH:MM format" });
					return;
				}

				// Validate opening hours logic
				const newOpensAt = opensAt || existingCourt.opensAt;
				const newClosesAt = closesAt || existingCourt.closesAt;
				const openTime = new Date(`1970-01-01T${newOpensAt}:00`);
				const closeTime = new Date(`1970-01-01T${newClosesAt}:00`);
				if (openTime >= closeTime) {
					res
						.status(400)
						.json({ message: "Opening time must be before closing time" });
					return;
				}
			}

			// Verify sport exists if sportId is provided
			if (sportId) {
				const sport = await prisma.sport.findUnique({
					where: { id: sportId },
				});

				if (!sport) {
					res.status(404).json({ message: "Sport not found" });
					return;
				}
			}

			// Check for duplicate court name if name is being updated
			if (name && name !== existingCourt.name) {
				const duplicateCourt = await prisma.court.findFirst({
					where: {
						facilityId: existingCourt.facilityId,
						name,
						id: { not: courtId },
					},
				});

				if (duplicateCourt) {
					res
						.status(409)
						.json({
							message: "A court with this name already exists in this facility",
						});
					return;
				}
			}

			const updatedCourt = await prisma.court.update({
				where: { id: courtId },
				data: {
					...(name && { name }),
					...(sportId && { sportId }),
					...(pricePerHour && { pricePerHour }),
					...(opensAt && { opensAt }),
					...(closesAt && { closesAt }),
					...(isActive !== undefined && { isActive }),
				},
				include: {
					sport: {
						select: {
							id: true,
							name: true,
							icon: true,
						},
					},
					facility: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			res.status(200).json({
				message: "Court updated successfully",
				data: updatedCourt,
			});
		} catch (error) {
			console.error("Update court error:", error);
			res.status(500).json({
				message: "Failed to update court",
				error: error instanceof Error ? error.message : "Internal server error",
			});
		}
	}

	/**
	 * Delete court (facility owners only)
	 */
	static async deleteCourt(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		try {
			const userId = req.user?.id || req.userId;
			if (!userId) {
				res.status(401).json({ message: "User not authenticated" });
				return;
			}

			const { courtId } = req.params;

			const court = await prisma.court.findUnique({
				where: { id: courtId },
				include: {
					facility: {
						select: {
							ownerId: true,
						},
					},
					_count: {
						select: {
							bookings: true,
						},
					},
				},
			});

			if (!court) {
				res.status(404).json({ message: "Court not found" });
				return;
			}

			// Verify ownership
			if (court.facility.ownerId !== userId && req.user?.role !== "ADMIN") {
				res
					.status(403)
					.json({
						message: "Access denied. You can only delete your own courts",
					});
				return;
			}

			// Check for existing bookings
			const futureBookings = await prisma.booking.findMany({
				where: {
					courtId,
					startsAt: {
						gt: new Date(),
					},
					status: {
						in: ["CONFIRMED", "PENDING"],
					},
				},
			});

			if (futureBookings.length > 0) {
				res.status(400).json({
					message:
						"Cannot delete court with future bookings. Please cancel or complete all bookings first.",
					futureBookingsCount: futureBookings.length,
				});
				return;
			}

			await prisma.court.delete({
				where: { id: courtId },
			});

			res.status(200).json({
				message: "Court deleted successfully",
			});
		} catch (error) {
			console.error("Delete court error:", error);
			res.status(500).json({
				message: "Failed to delete court",
				error: error instanceof Error ? error.message : "Internal server error",
			});
		}
	}

	/**
	 * Get court availability for a specific date
	 */
	static async getCourtAvailability(
		req: Request,
		res: Response
	): Promise<void> {
		try {
			const { courtId } = req.params;
			const { date, startTime, endTime } = req.query as {
				date: string;
				startTime?: string;
				endTime?: string;
			};

			if (!date) {
				res.status(400).json({ message: "Date is required" });
				return;
			}

			// Validate date format
			const targetDate = new Date(date);
			if (isNaN(targetDate.getTime())) {
				res
					.status(400)
					.json({ message: "Invalid date format. Use YYYY-MM-DD" });
				return;
			}

			// Get court details
			const court = await prisma.court.findUnique({
				where: { id: courtId },
				select: {
					id: true,
					name: true,
					opensAt: true,
					closesAt: true,
					isActive: true,
				},
			});

			if (!court) {
				res.status(404).json({ message: "Court not found" });
				return;
			}

			if (!court.isActive) {
				res.status(400).json({ message: "Court is currently inactive" });
				return;
			}

			// Set date range for the specific day
			const dayStart = new Date(targetDate);
			dayStart.setHours(0, 0, 0, 0);
			const dayEnd = new Date(targetDate);
			dayEnd.setHours(23, 59, 59, 999);

			// Get existing bookings for the date
			const bookings = await prisma.booking.findMany({
				where: {
					courtId,
					startsAt: {
						gte: dayStart,
						lte: dayEnd,
					},
					status: {
						in: ["CONFIRMED", "PENDING"],
					},
				},
				select: {
					startsAt: true,
					endsAt: true,
					status: true,
				},
				orderBy: { startsAt: "asc" },
			});

			// Get court unavailabilities for the date
			const unavailabilities = await prisma.courtUnavailability.findMany({
				where: {
					courtId,
					startsAt: {
						lte: dayEnd,
					},
					endsAt: {
						gte: dayStart,
					},
				},
				select: {
					startsAt: true,
					endsAt: true,
					reason: true,
				},
				orderBy: { startsAt: "asc" },
			});

			// Generate time slots based on court hours
			const generateTimeSlots = (opensAt: string, closesAt: string) => {
				const slots = [];
				const [openHour, openMinute] = opensAt.split(":").map(Number);
				const [closeHour, closeMinute] = closesAt.split(":").map(Number);

				const current = new Date(targetDate);
				current.setHours(openHour, openMinute, 0, 0);

				const end = new Date(targetDate);
				end.setHours(closeHour, closeMinute, 0, 0);

				while (current < end) {
					const slotStart = new Date(current);
					current.setHours(current.getHours() + 1); // 1-hour slots
					const slotEnd = new Date(current);

					if (slotEnd <= end) {
						slots.push({
							startTime: slotStart.toISOString(),
							endTime: slotEnd.toISOString(),
							available: true,
						});
					}
				}
				return slots;
			};

			let timeSlots = generateTimeSlots(court.opensAt, court.closesAt);

			// Mark slots as unavailable based on bookings
			timeSlots = timeSlots.map((slot) => {
				const slotStart = new Date(slot.startTime);
				const slotEnd = new Date(slot.endTime);

				// Check for booking conflicts
				const hasBookingConflict = bookings.some((booking) => {
					return (
						(slotStart >= booking.startsAt && slotStart < booking.endsAt) ||
						(slotEnd > booking.startsAt && slotEnd <= booking.endsAt) ||
						(slotStart <= booking.startsAt && slotEnd >= booking.endsAt)
					);
				});

				// Check for unavailability conflicts
				const hasUnavailabilityConflict = unavailabilities.some((unavail) => {
					return (
						(slotStart >= unavail.startsAt && slotStart < unavail.endsAt) ||
						(slotEnd > unavail.startsAt && slotEnd <= unavail.endsAt) ||
						(slotStart <= unavail.startsAt && slotEnd >= unavail.endsAt)
					);
				});

				return {
					...slot,
					available: !hasBookingConflict && !hasUnavailabilityConflict,
				};
			});

			// Filter by time range if provided
			if (startTime || endTime) {
				timeSlots = timeSlots.filter((slot) => {
					const slotTime = new Date(slot.startTime).toTimeString().slice(0, 5);
					if (startTime && slotTime < startTime) return false;
					if (endTime && slotTime >= endTime) return false;
					return true;
				});
			}

			res.status(200).json({
				message: "Court availability retrieved successfully",
				data: {
					court: {
						id: court.id,
						name: court.name,
						opensAt: court.opensAt,
						closesAt: court.closesAt,
					},
					date,
					timeSlots,
					summary: {
						totalSlots: timeSlots.length,
						availableSlots: timeSlots.filter((slot) => slot.available).length,
						bookedSlots: timeSlots.filter((slot) => !slot.available).length,
					},
				},
			});
		} catch (error) {
			console.error("Get court availability error:", error);
			res.status(500).json({
				message: "Failed to retrieve court availability",
				error: error instanceof Error ? error.message : "Internal server error",
			});
		}
	}

	/**
	 * Create court unavailability (facility owners only)
	 */
	static async createCourtUnavailability(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		try {
			const userId = req.user?.id || req.userId;
			if (!userId) {
				res.status(401).json({ message: "User not authenticated" });
				return;
			}

			const { courtId } = req.params;
			const { startsAt, endsAt, reason }: CreateCourtUnavailabilityInput =
				req.body;

			if (!startsAt || !endsAt || !reason) {
				res.status(400).json({ message: "All fields are required" });
				return;
			}

			const startDate = new Date(startsAt);
			const endDate = new Date(endsAt);

			if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
				res.status(400).json({ message: "Invalid date format" });
				return;
			}

			if (startDate >= endDate) {
				res.status(400).json({ message: "Start time must be before end time" });
				return;
			}

			if (startDate < new Date()) {
				res
					.status(400)
					.json({ message: "Cannot create unavailability for past dates" });
				return;
			}

			// Verify court ownership
			const court = await prisma.court.findUnique({
				where: { id: courtId },
				include: {
					facility: {
						select: {
							ownerId: true,
						},
					},
				},
			});

			if (!court) {
				res.status(404).json({ message: "Court not found" });
				return;
			}

			if (court.facility.ownerId !== userId && req.user?.role !== "ADMIN") {
				res
					.status(403)
					.json({
						message:
							"Access denied. You can only manage unavailabilities for your own courts",
					});
				return;
			}

			// Check for existing bookings in the unavailability period
			const conflictingBookings = await prisma.booking.findMany({
				where: {
					courtId,
					startsAt: {
						lt: endDate,
					},
					endsAt: {
						gt: startDate,
					},
					status: {
						in: ["CONFIRMED", "PENDING"],
					},
				},
			});

			if (conflictingBookings.length > 0) {
				res.status(400).json({
					message:
						"Cannot create unavailability period that conflicts with existing bookings",
					conflictingBookings: conflictingBookings.length,
				});
				return;
			}

			const unavailability = await prisma.courtUnavailability.create({
				data: {
					courtId,
					startsAt: startDate,
					endsAt: endDate,
					reason,
				},
			});

			res.status(201).json({
				message: "Court unavailability created successfully",
				data: unavailability,
			});
		} catch (error) {
			console.error("Create court unavailability error:", error);
			res.status(500).json({
				message: "Failed to create court unavailability",
				error: error instanceof Error ? error.message : "Internal server error",
			});
		}
	}

	/**
	 * Get all sports
	 */
	static async getAllSports(req: Request, res: Response): Promise<void> {
		try {
			const sports = await prisma.sport.findMany({
				select: {
					id: true,
					name: true,
					icon: true,
					_count: {
						select: {
							courts: true,
						},
					},
				},
				orderBy: { name: "asc" },
			});

			res.status(200).json({
				message: "Sports retrieved successfully",
				data: sports,
			});
		} catch (error) {
			console.error("Get all sports error:", error);
			res.status(500).json({
				message: "Failed to retrieve sports",
				error: error instanceof Error ? error.message : "Internal server error",
			});
		}
	}

	/**
	 * Create a new sport (admin only)
	 */
	static async createSport(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		try {
			const userId = req.user?.id || req.userId;
			if (!userId) {
				res.status(401).json({ message: "User not authenticated" });
				return;
			}

			if (req.user?.role !== "ADMIN") {
				res
					.status(403)
					.json({ message: "Access denied. Admin privileges required" });
				return;
			}

			const { name, icon }: CreateSportInput = req.body;

			if (!name) {
				res.status(400).json({ message: "Sport name is required" });
				return;
			}

			// Check for duplicate sport name
			const existingSport = await prisma.sport.findUnique({
				where: { name },
			});

			if (existingSport) {
				res
					.status(409)
					.json({ message: "A sport with this name already exists" });
				return;
			}

			const sport = await prisma.sport.create({
				data: {
					name,
					...(icon && { icon }),
				},
			});

			res.status(201).json({
				message: "Sport created successfully",
				data: sport,
			});
		} catch (error) {
			console.error("Create sport error:", error);
			res.status(500).json({
				message: "Failed to create sport",
				error: error instanceof Error ? error.message : "Internal server error",
			});
		}
	}
}

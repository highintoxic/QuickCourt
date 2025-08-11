import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController.js";
import { prisma } from "../config/prisma.js";
import {
	CreateFacilityInput,
	UpdateFacilityInput,
	FacilityQuery,
	UpdateFacilityStatusInput,
} from "../types/controller-types.js";

export class FacilityController extends BaseController {
	// Create a new facility (Facility Owner or Admin)
	async createFacility(req: Request, res: Response, next: NextFunction) {
		try {
			const facilityData = req.body as CreateFacilityInput;
			const ownerId = req.user!.id;

			const facility = await prisma.facility.create({
				data: {
					...facilityData,
					ownerId,
				},
			});

			return this.success(res, facility, "Facility created successfully", 201);
		} catch (error) {
			next(error);
		}
	}

	// Get user's facilities (Facility Owner)
	async getUserFacilities(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user!.id;
			const isAdmin = req.user!.role === "ADMIN";

			const facilities = await prisma.facility.findMany({
				where: isAdmin ? {} : { ownerId: userId },
				select: {
					id: true,
					name: true,
					description: true,
					addressLine: true,
					city: true,
					state: true,
					pincode: true,
					phone: true,
					email: true,
					isActive: true,
					status: true,
					createdAt: true,
					updatedAt: true,
					owner: {
						select: {
							id: true,
							email: true,
							fullName: true,
						},
					},
				},
			});

			return this.success(res, facilities);
		} catch (error) {
			next(error);
		}
	}

	// Get facility by ID
	async getFacilityById(req: Request, res: Response, next: NextFunction) {
		try {
			const { facilityId } = req.params;
			const userId = req.user!.id;
			const isAdmin = req.user!.role === "ADMIN";

			const facility = await prisma.facility.findUnique({
				where: { id: facilityId },
				include: {
					owner: {
						select: {
							id: true,
							email: true,
							fullName: true,
						},
					},
					courts: {
						select: {
							id: true,
							name: true,
							sport: true,
							pricePerHour: true,
							isActive: true,
						},
					},
					photos: true,
					amenities: true,
				},
			});

			if (!facility) {
				return this.notFound(res, "Facility");
			}

			// Check ownership (admin can access all)
			if (!isAdmin && facility.ownerId !== userId) {
				return this.forbidden(res, "You can only access your own facilities");
			}

			return this.success(res, facility);
		} catch (error) {
			next(error);
		}
	}

	// Update facility
	async updateFacility(req: Request, res: Response, next: NextFunction) {
		try {
			const { facilityId } = req.params;
			const updateData = req.body as UpdateFacilityInput;
			const userId = req.user!.id;
			const isAdmin = req.user!.role === "ADMIN";

			const facility = await prisma.facility.findUnique({
				where: { id: facilityId },
			});

			if (!facility) {
				return this.notFound(res, "Facility");
			}

			// Check ownership (admin can update all)
			if (!isAdmin && facility.ownerId !== userId) {
				return this.forbidden(res, "You can only update your own facilities");
			}

			const updatedFacility = await prisma.facility.update({
				where: { id: facilityId },
				data: updateData,
				include: {
					owner: {
						select: {
							id: true,
							email: true,
							fullName: true,
						},
					},
				},
			});

			return this.success(
				res,
				updatedFacility,
				"Facility updated successfully"
			);
		} catch (error) {
			next(error);
		}
	}

	// Delete facility
	async deleteFacility(req: Request, res: Response, next: NextFunction) {
		try {
			const { facilityId } = req.params;
			const userId = req.user!.id;
			const isAdmin = req.user!.role === "ADMIN";

			const facility = await prisma.facility.findUnique({
				where: { id: facilityId },
			});

			if (!facility) {
				return this.notFound(res, "Facility");
			}

			// Check ownership (admin can delete all)
			if (!isAdmin && facility.ownerId !== userId) {
				return this.forbidden(res, "You can only delete your own facilities");
			}

			await prisma.facility.delete({
				where: { id: facilityId },
			});

			return this.success(res, null, "Facility deleted successfully");
		} catch (error) {
			next(error);
		}
	}

	// Get all facilities (Public - for users to browse)
	async getAllFacilities(req: Request, res: Response, next: NextFunction) {
		try {
			const query = req.query as FacilityQuery;
			const page = parseInt(query.page || "1");
			const limit = parseInt(query.limit || "10");
			const skip = (page - 1) * limit;

			const whereClause: any = {
				isActive: true,
				status: "APPROVED",
			};

			if (query.search) {
				whereClause.OR = [
					{ name: { contains: query.search, mode: "insensitive" } },
					{ description: { contains: query.search, mode: "insensitive" } },
					{ city: { contains: query.search, mode: "insensitive" } },
				];
			}

			if (query.city) {
				whereClause.city = { contains: query.city, mode: "insensitive" };
			}

			if (query.state) {
				whereClause.state = { contains: query.state, mode: "insensitive" };
			}

			const [facilities, total] = await Promise.all([
				prisma.facility.findMany({
					where: whereClause,
					select: {
						id: true,
						name: true,
						description: true,
						addressLine: true,
						city: true,
						state: true,
						phone: true,
						email: true,
						ratingAvg: true,
						ratingCount: true,
						photos: {
							take: 1,
							orderBy: { sortOrder: "asc" },
						},
						createdAt: true,
					},
					skip,
					take: limit,
					orderBy: query.sort
						? { [query.sort]: query.order || "desc" }
						: { createdAt: "desc" },
				}),
				prisma.facility.count({ where: whereClause }),
			]);

			return this.successWithPagination(res, facilities, {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			});
		} catch (error) {
			next(error);
		}
	}
}

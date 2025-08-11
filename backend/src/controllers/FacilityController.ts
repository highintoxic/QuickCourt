import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController.js";
import { prisma } from "../config/prisma.js";

export class FacilityController extends BaseController {
	// Create a new facility (Facility Owner or Admin)
	async createFacility(req: Request, res: Response, next: NextFunction) {
		try {
			const { name, description, address, phone, email } = req.body;
			const ownerId = req.user!.id;

			const facility = await prisma.facility.create({
				data: {
					name,
					description,
					address,
					phone,
					email,
					ownerId,
				} as any, // Will fix after Prisma regeneration
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
					address: true,
					phone: true,
					email: true,
					isActive: true,
					createdAt: true,
					updatedAt: true,
					owner: {
						select: {
							id: true,
							email: true,
						},
					},
				},
			} as any); // Will fix after Prisma regeneration

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
						},
					},
				},
			} as any); // Will fix after Prisma regeneration

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
			const { name, description, address, phone, email, isActive } = req.body;
			const userId = req.user!.id;
			const isAdmin = req.user!.role === "ADMIN";

			const facility = await prisma.facility.findUnique({
				where: { id: facilityId },
			} as any);

			if (!facility) {
				return this.notFound(res, "Facility");
			}

			// Check ownership (admin can update all)
			if (!isAdmin && facility.ownerId !== userId) {
				return this.forbidden(res, "You can only update your own facilities");
			}

			const updatedFacility = await prisma.facility.update({
				where: { id: facilityId },
				data: {
					...(name && { name }),
					...(description !== undefined && { description }),
					...(address && { address }),
					...(phone !== undefined && { phone }),
					...(email !== undefined && { email }),
					...(isActive !== undefined && { isActive }),
				},
				include: {
					owner: {
						select: {
							id: true,
							email: true,
						},
					},
				},
			} as any); // Will fix after Prisma regeneration

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
			} as any);

			if (!facility) {
				return this.notFound(res, "Facility");
			}

			// Check ownership (admin can delete all)
			if (!isAdmin && facility.ownerId !== userId) {
				return this.forbidden(res, "You can only delete your own facilities");
			}

			await prisma.facility.delete({
				where: { id: facilityId },
			} as any);

			return this.success(res, null, "Facility deleted successfully");
		} catch (error) {
			next(error);
		}
	}

	// Get all facilities (Public - for users to browse)
	async getAllFacilities(req: Request, res: Response, next: NextFunction) {
		try {
			const facilities = await prisma.facility.findMany({
				where: { isActive: true },
				select: {
					id: true,
					name: true,
					description: true,
					address: true,
					phone: true,
					email: true,
					createdAt: true,
				},
			} as any); // Will fix after Prisma regeneration

			return this.success(res, facilities);
		} catch (error) {
			next(error);
		}
	}
}

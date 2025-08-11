import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController.js";
import { prisma } from "../config/prisma.js";
import type { PaginationQueryInput } from "../utils/validation.js";

export class AdminController extends BaseController {
	// Get all users (Admin only)
	async getAllUsers(req: Request, res: Response, next: NextFunction) {
		try {
			const { page, limit, sort, order }  = req.query as unknown as PaginationQueryInput;

			const skip = (page - 1) * limit;
			const orderBy = sort ? { [sort]: order } : { createdAt: order };

			const [users, total] = await Promise.all([
				prisma.user.findMany({
					skip,
					take: limit,
					orderBy,
					select: {
						id: true,
						email: true,
						phone: true,
						role: true,
						isVerified: true,
						createdAt: true,
						updatedAt: true,
					},
				}),
				prisma.user.count(),
			]);

			return this.success(res, {
				users,
				pagination: {
					page,
					limit,
					total,
					totalPages: Math.ceil(total / limit),
				},
			});
		} catch (error) {
			next(error);
		}
	}

	// Update user role (Admin only)
	async updateUserRole(req: Request, res: Response, next: NextFunction) {
		try {
			const { userId } = req.params;
			const { role } = req.body;

			if (!["USER", "ADMIN", "FACILITY_OWNER"].includes(role)) {
				return this.error(res, "Invalid role", 400);
			}

			const user = await prisma.user.findUnique({ where: { id: userId } });
			if (!user) {
				return this.notFound(res, "User");
			}

			const updatedUser = await prisma.user.update({
				where: { id: userId },
				data: { role: role as any }, // Will fix after Prisma regeneration
				select: {
					id: true,
					email: true,
					phone: true,
					role: true,
					isVerified: true,
					updatedAt: true,
				},
			});

			return this.success(res, updatedUser, "User role updated successfully");
		} catch (error) {
			next(error);
		}
	}

	// Delete user (Admin only)
	async deleteUser(req: Request, res: Response, next: NextFunction) {
		try {
			const { userId } = req.params;

			const user = await prisma.user.findUnique({ where: { id: userId } });
			if (!user) {
				return this.notFound(res, "User");
			}

			// Don't allow admin to delete themselves
			if (req.user?.id === userId) {
				return this.error(res, "Cannot delete your own account", 400);
			}

			await prisma.user.delete({ where: { id: userId } });

			return this.success(res, null, "User deleted successfully");
		} catch (error) {
			next(error);
		}
	}

	// Get system stats (Admin only)
	async getSystemStats(req: Request, res: Response, next: NextFunction) {
		try {
			const [
				totalUsers,
				totalAdmins,
				totalFacilityOwners,
				verifiedUsers,
				totalFacilities,
				activeFacilities,
			] = await Promise.all([
				prisma.user.count(),
				prisma.user.count({ where: { role: "ADMIN" as any } }),
				prisma.user.count({ where: { role: "FACILITY_OWNER" as any } }),
				prisma.user.count({ where: { isVerified: true } }),
				prisma.facility.count(),
				prisma.facility.count({ where: { isActive: true } }),
			]);

			const stats = {
				users: {
					total: totalUsers,
					admins: totalAdmins,
					facilityOwners: totalFacilityOwners,
					verified: verifiedUsers,
					unverified: totalUsers - verifiedUsers,
				},
				facilities: {
					total: totalFacilities,
					active: activeFacilities,
					inactive: totalFacilities - activeFacilities,
				},
			};

			return this.success(res, stats, "System stats retrieved successfully");
		} catch (error) {
			next(error);
		}
	}
}

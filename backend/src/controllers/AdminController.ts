import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { prisma } from "../config/prisma";
import { UserRole, FacilityStatus } from "@prisma/client";
import {
	UpdateUserRoleInput,
	UpdateFacilityStatusInput,
	PaginationQuery,
} from "../types/controller-types";

export class AdminController extends BaseController {
	// Get all users (Admin only)
	async getAllUsers(req: Request, res: Response, next: NextFunction) {
		try {
			const query = req.query as PaginationQuery;
			const page = parseInt(query.page || "1");
			const limit = parseInt(query.limit || "10");
			const skip = (page - 1) * limit;

			const orderBy =
				query.sort &&
				query.sort in { createdAt: true, fullName: true, email: true }
					? { [query.sort]: query.order || ("desc" as "asc" | "desc") }
					: { createdAt: "desc" as "desc" };

			const [users, total] = await Promise.all([
				prisma.user.findMany({
					skip,
					take: limit,
					orderBy,
					select: {
						id: true,
						fullName: true,
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

			return this.successWithPagination(res, users, {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			});
		} catch (error) {
			next(error);
		}
	}

	// Update user role (Admin only)
	async updateUserRole(req: Request, res: Response, next: NextFunction) {
		try {
			const { userId } = req.params;
			const { role } = req.body as UpdateUserRoleInput;

			const updatedUser = await prisma.user.update({
				where: { id: userId },
				data: { role },
				select: {
					id: true,
					fullName: true,
					email: true,
					role: true,
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
			const currentUserId = req.user!.id;

			// Prevent admin from deleting themselves
			if (userId === currentUserId) {
				return this.error(res, "Cannot delete your own account", 400);
			}

			// Check if user exists
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					fullName: true,
					email: true,
					role: true,
				},
			});

			if (!user) {
				return this.notFound(res, "User");
			}

			// Delete user and related data
			await prisma.user.delete({
				where: { id: userId },
			});

			return this.success(res, null, "User deleted successfully");
		} catch (error) {
			next(error);
		}
	}

	// Update facility status (Admin only)
	async updateFacilityStatus(req: Request, res: Response, next: NextFunction) {
		try {
			const { facilityId } = req.params;
			const { status, rejectionReason } = req.body as UpdateFacilityStatusInput;

			const updateData: any = { status };
			if (status === FacilityStatus.REJECTED && rejectionReason) {
				updateData.rejectionReason = rejectionReason;
			}

			const updatedFacility = await prisma.facility.update({
				where: { id: facilityId },
				data: updateData,
				include: {
					owner: {
						select: {
							id: true,
							fullName: true,
							email: true,
						},
					},
				},
			});

			return this.success(
				res,
				updatedFacility,
				"Facility status updated successfully"
			);
		} catch (error) {
			next(error);
		}
	}

	// Get admin dashboard statistics
	async getDashboardStats(req: Request, res: Response, next: NextFunction) {
		try {
			const [
				totalUsers,
				totalFacilities,
				totalBookings,
				pendingFacilities,
				adminCount,
				facilityOwnerCount,
			] = await Promise.all([
				prisma.user.count(),
				prisma.facility.count(),
				prisma.booking.count(),
				prisma.facility.count({ where: { status: FacilityStatus.PENDING } }),
				prisma.user.count({ where: { role: UserRole.ADMIN } }),
				prisma.user.count({ where: { role: UserRole.FACILITY_OWNER } }),
			]);

			const stats = {
				users: {
					total: totalUsers,
					admins: adminCount,
					facilityOwners: facilityOwnerCount,
					regularUsers: totalUsers - adminCount - facilityOwnerCount,
				},
				facilities: {
					total: totalFacilities,
					pending: pendingFacilities,
					approved: totalFacilities - pendingFacilities,
				},
				bookings: {
					total: totalBookings,
				},
			};

			return this.success(res, stats);
		} catch (error) {
			next(error);
		}
	}

	// Get system statistics (Admin only) - alias for getDashboardStats
	async getSystemStats(req: Request, res: Response, next: NextFunction) {
		try {
			const [
				totalUsers,
				totalFacilities,
				totalBookings,
				totalPayments,
				pendingFacilities,
				approvedFacilities,
				rejectedFacilities,
				adminCount,
				facilityOwnerCount,
				regularUserCount,
				totalRevenue,
				thisMonthBookings,
				thisMonthRevenue,
			] = await Promise.all([
				prisma.user.count(),
				prisma.facility.count(),
				prisma.booking.count(),
				prisma.payment.count(),
				prisma.facility.count({ where: { status: FacilityStatus.PENDING } }),
				prisma.facility.count({ where: { status: FacilityStatus.APPROVED } }),
				prisma.facility.count({ where: { status: FacilityStatus.REJECTED } }),
				prisma.user.count({ where: { role: UserRole.ADMIN } }),
				prisma.user.count({ where: { role: UserRole.FACILITY_OWNER } }),
				prisma.user.count({ where: { role: UserRole.USER } }),
				prisma.payment.aggregate({
					_sum: { amount: true },
					where: { status: "CAPTURED" },
				}),
				prisma.booking.count({
					where: {
						createdAt: {
							gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
						},
					},
				}),
				prisma.payment.aggregate({
					_sum: { amount: true },
					where: {
						status: "CAPTURED",
						createdAt: {
							gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
						},
					},
				}),
			]);

			const stats = {
				overview: {
					totalUsers,
					totalFacilities,
					totalBookings,
					totalPayments,
					totalRevenue: totalRevenue._sum.amount || 0,
				},
				users: {
					total: totalUsers,
					admins: adminCount,
					facilityOwners: facilityOwnerCount,
					regular: regularUserCount,
				},
				facilities: {
					total: totalFacilities,
					pending: pendingFacilities,
					approved: approvedFacilities,
					rejected: rejectedFacilities,
				},
				bookings: {
					total: totalBookings,
					thisMonth: thisMonthBookings,
				},
				revenue: {
					total: totalRevenue._sum.amount || 0,
					thisMonth: thisMonthRevenue._sum.amount || 0,
				},
				growth: {
					bookingsThisMonth: thisMonthBookings,
					revenueThisMonth: thisMonthRevenue._sum.amount || 0,
				},
			};

			return this.success(res, stats);
		} catch (error) {
			next(error);
		}
	}

	// Get all facilities for admin review
	async getAllFacilitiesForReview(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		try {
			const query = req.query as PaginationQuery & { status?: string };
			const page = parseInt(query.page || "1");
			const limit = parseInt(query.limit || "10");
			const skip = (page - 1) * limit;

			const whereClause: any = {};
			if (
				query.status &&
				Object.values(FacilityStatus).includes(query.status as FacilityStatus)
			) {
				whereClause.status = query.status;
			}

			const orderBy =
				query.sort &&
				query.sort in { createdAt: true, name: true, status: true }
					? { [query.sort]: query.order || ("desc" as "asc" | "desc") }
					: { createdAt: "desc" as "desc" };

			const [facilities, total] = await Promise.all([
				prisma.facility.findMany({
					where: whereClause,
					skip,
					take: limit,
					orderBy,
					include: {
						owner: {
							select: {
								id: true,
								fullName: true,
								email: true,
							},
						},
						_count: {
							select: {
								courts: true,
								reviews: true,
							},
						},
					},
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

export default new AdminController();

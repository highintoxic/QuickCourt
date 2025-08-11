import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";
import {
	UpdateUserProfileInput,
	ChangePasswordInput,
} from "../types/controller-types";

interface AuthenticatedRequest extends AuthRequest {
	user?: {
		id: string;
		email: string;
		role: string;
		isVerified: boolean;
	};
}

export class UserController {
	/**
	 * Get current user profile
	 */
	static async getProfile(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		try {
			const userId = req.user?.id || req.userId;
			if (!userId) {
				res.status(401).json({ message: "User not authenticated" });
				return;
			}

			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					fullName: true,
					email: true,
					phone: true,
					role: true,
					avatarUrl: true,
					isVerified: true,
					createdAt: true,
					_count: {
						select: {
							facilities: true,
							bookings: true,
							reviews: true,
						},
					},
				},
			});

			if (!user) {
				res.status(404).json({ message: "User not found" });
				return;
			}

			res.status(200).json({
				message: "Profile retrieved successfully",
				data: user,
			});
		} catch (error) {
			console.error("Get profile error:", error);
			res.status(500).json({
				message: "Failed to retrieve profile",
				error: error instanceof Error ? error.message : "Internal server error",
			});
		}
	}

	/**
	 * Update user profile
	 */
	static async updateProfile(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		try {
			const userId = req.user?.id || req.userId;
			if (!userId) {
				res.status(401).json({ message: "User not authenticated" });
				return;
			}

			const { fullName, phone, avatarUrl }: UpdateUserProfileInput = req.body;

			// Validate input
			if (!fullName && !phone && !avatarUrl) {
				res
					.status(400)
					.json({ message: "At least one field must be provided for update" });
				return;
			}

			// Validate phone format if provided
			if (phone && !/^\+?[\d\s\-()]{10,}$/.test(phone)) {
				res.status(400).json({ message: "Invalid phone number format" });
				return;
			}

			// Check if phone is already taken by another user
			if (phone) {
				const existingUser = await prisma.user.findFirst({
					where: {
						phone,
						id: { not: userId },
					},
				});

				if (existingUser) {
					res
						.status(409)
						.json({ message: "Phone number is already registered" });
					return;
				}
			}

			const updatedUser = await prisma.user.update({
				where: { id: userId },
				data: {
					...(fullName && { fullName }),
					...(phone && { phone }),
					...(avatarUrl && { avatarUrl }),
					updatedAt: new Date(),
				},
				select: {
					id: true,
					fullName: true,
					email: true,
					phone: true,
					role: true,
					avatarUrl: true,
					isVerified: true,
					updatedAt: true,
				},
			});

			res.status(200).json({
				message: "Profile updated successfully",
				data: updatedUser,
			});
		} catch (error) {
			console.error("Update profile error:", error);
			res.status(500).json({
				message: "Failed to update profile",
				error: error instanceof Error ? error.message : "Internal server error",
			});
		}
	}

	/**
	 * Change password
	 */
	static async changePassword(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		try {
			const userId = req.user?.id || req.userId;
			if (!userId) {
				res.status(401).json({ message: "User not authenticated" });
				return;
			}

			const {
				currentPassword,
				newPassword,
				confirmPassword,
			}: ChangePasswordInput = req.body;

			// Validate input
			if (!currentPassword || !newPassword || !confirmPassword) {
				res.status(400).json({ message: "All password fields are required" });
				return;
			}

			if (newPassword !== confirmPassword) {
				res
					.status(400)
					.json({ message: "New password and confirmation do not match" });
				return;
			}

			// Validate password strength
			if (newPassword.length < 8) {
				res
					.status(400)
					.json({ message: "New password must be at least 8 characters long" });
				return;
			}

			if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
				res.status(400).json({
					message:
						"New password must contain at least one lowercase letter, one uppercase letter, and one number",
				});
				return;
			}

			// Get current user with password hash
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					passwordHash: true,
				},
			});

			if (!user) {
				res.status(404).json({ message: "User not found" });
				return;
			}

			// Verify current password
			const isCurrentPasswordValid = await bcrypt.compare(
				currentPassword,
				user.passwordHash
			);
			if (!isCurrentPasswordValid) {
				res.status(400).json({ message: "Current password is incorrect" });
				return;
			}

			// Check if new password is same as current
			const isSamePassword = await bcrypt.compare(
				newPassword,
				user.passwordHash
			);
			if (isSamePassword) {
				res
					.status(400)
					.json({
						message: "New password must be different from current password",
					});
				return;
			}

			// Hash new password
			const saltRounds = 12;
			const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

			// Update password
			await prisma.user.update({
				where: { id: userId },
				data: {
					passwordHash: newPasswordHash,
					updatedAt: new Date(),
				},
			});

			res.status(200).json({
				message: "Password changed successfully",
			});
		} catch (error) {
			console.error("Change password error:", error);
			res.status(500).json({
				message: "Failed to change password",
				error: error instanceof Error ? error.message : "Internal server error",
			});
		}
	}

	/**
	 * Delete user account
	 */
	static async deleteAccount(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		try {
			const userId = req.user?.id || req.userId;
			if (!userId) {
				res.status(401).json({ message: "User not authenticated" });
				return;
			}

			const { password } = req.body;

			if (!password) {
				res
					.status(400)
					.json({ message: "Password is required to delete account" });
				return;
			}

			// Get user with password hash
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					passwordHash: true,
					email: true,
				},
			});

			if (!user) {
				res.status(404).json({ message: "User not found" });
				return;
			}

			// Verify password
			const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
			if (!isPasswordValid) {
				res.status(400).json({ message: "Incorrect password" });
				return;
			}

			// Check for active bookings
			const activeBookings = await prisma.booking.findMany({
				where: {
					userId,
					startsAt: {
						gt: new Date(),
					},
					status: "CONFIRMED",
				},
			});

			if (activeBookings.length > 0) {
				res.status(400).json({
					message:
						"Cannot delete account with active bookings. Please cancel or complete all bookings first.",
					activeBookingsCount: activeBookings.length,
				});
				return;
			}

			// Soft delete - update email to mark as deleted
			await prisma.user.update({
				where: { id: userId },
				data: {
					email: `deleted_${userId}_${Date.now()}@deleted.local`,
					isVerified: false,
					updatedAt: new Date(),
				},
			});

			res.status(200).json({
				message: "Account deleted successfully",
			});
		} catch (error) {
			console.error("Delete account error:", error);
			res.status(500).json({
				message: "Failed to delete account",
				error: error instanceof Error ? error.message : "Internal server error",
			});
		}
	}

	/**
	 * Get user statistics
	 */
	static async getUserStats(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		try {
			const userId = req.user?.id || req.userId;
			if (!userId) {
				res.status(401).json({ message: "User not authenticated" });
				return;
			}

			const [bookingStats, facilityStats, reviewStats] = await Promise.all([
				// Booking statistics
				prisma.booking.groupBy({
					by: ["status"],
					where: { userId },
					_count: true,
				}),
				// Facility statistics (if owner)
				prisma.facility.groupBy({
					by: ["status"],
					where: { ownerId: userId },
					_count: true,
				}),
				// Review statistics
				prisma.review.aggregate({
					where: { userId },
					_count: true,
					_avg: { rating: true },
				}),
			]);

			const stats = {
				bookings: {
					total: bookingStats.reduce(
						(sum: number, stat: any) => sum + stat._count,
						0
					),
					byStatus: bookingStats.reduce(
						(acc: Record<string, number>, stat: any) => {
							acc[stat.status] = stat._count;
							return acc;
						},
						{} as Record<string, number>
					),
				},
				facilities: {
					total: facilityStats.reduce(
						(sum: number, stat: any) => sum + stat._count,
						0
					),
					byStatus: facilityStats.reduce(
						(acc: Record<string, number>, stat: any) => {
							acc[stat.status] = stat._count;
							return acc;
						},
						{} as Record<string, number>
					),
				},
				reviews: {
					total: reviewStats._count,
					averageRating: reviewStats._avg.rating || 0,
				},
			};

			res.status(200).json({
				message: "User statistics retrieved successfully",
				data: stats,
			});
		} catch (error) {
			console.error("Get user stats error:", error);
			res.status(500).json({
				message: "Failed to retrieve user statistics",
				error: error instanceof Error ? error.message : "Internal server error",
			});
		}
	}
}

import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController.js";
import {
	register,
	authenticate,
	rotateRefreshToken,
	revokeRefreshToken,
	revokeAllUserTokens,
} from "../services/authService.js";
import { createAndStoreOTP, verifyOTP } from "../services/otpService.js";
import { sendEmailOTP } from "../services/emailService.js";
import { sendSmsOTP, sendWhatsAppOTP } from "../services/smsService.js";
import { prisma } from "../config/prisma.js";
import type {
	RegisterInput,
	LoginInput,
	RefreshTokenInput,
	LogoutInput,
	LogoutAllInput,
	RequestOTPInput,
	VerifyOTPInput,
} from "../utils/validation.js";

export class AuthController extends BaseController {
	// User registration
	async register(req: Request, res: Response, next: NextFunction) {
		try {
			const { email, password, phone, role } = req.body as RegisterInput;

			// Check if user already exists
			const existingUser = await prisma.user.findUnique({ where: { email } });
			if (existingUser) {
				return this.error(res, "User already exists with this email", 409);
			}

			const user = await register(email, password, phone, role || "USER");
			return this.success(res, { user }, "User registered successfully", 201);
		} catch (error: any) {
			if (error.message.includes("Unique constraint")) {
				return this.error(res, "User already exists with this email", 409);
			}
			next(error);
		}
	}

	// User login
	async login(req: Request, res: Response, next: NextFunction) {
		try {
			const { email, password } = req.body as LoginInput;

			const tokens = await authenticate(email, password);
			return this.success(res, tokens, "Login successful");
		} catch (error: any) {
			if (
				error.message.includes("Invalid credentials") ||
				error.message.includes("User not found")
			) {
				return this.error(res, "Invalid email or password", 401);
			}
			next(error);
		}
	}

	// Refresh token
	async refreshToken(req: Request, res: Response, next: NextFunction) {
		try {
			const { refreshToken } = req.body as RefreshTokenInput;

			const tokens = await rotateRefreshToken(refreshToken);
			return this.success(res, tokens, "Token refreshed successfully");
		} catch (error: any) {
			if (
				error.message.includes("Invalid") ||
				error.message.includes("expired")
			) {
				return this.error(res, "Invalid or expired refresh token", 401);
			}
			next(error);
		}
	}

	// Logout (revoke single token)
	async logout(req: Request, res: Response, next: NextFunction) {
		try {
			const { refreshTokenId } = req.body as LogoutInput;

			await revokeRefreshToken(refreshTokenId);
			return this.success(res, null, "Logged out successfully");
		} catch (error: any) {
			if (error.message.includes("not found")) {
				return this.error(res, "Invalid refresh token", 404);
			}
			next(error);
		}
	}

	// Logout from all devices
	async logoutAll(req: Request, res: Response, next: NextFunction) {
		try {
			const { userId } = req.body as LogoutAllInput;

			// Verify user exists
			const user = await prisma.user.findUnique({ where: { id: userId } });
			if (!user) {
				return this.notFound(res, "User");
			}

			await revokeAllUserTokens(userId);
			return this.success(
				res,
				null,
				"Logged out from all devices successfully"
			);
		} catch (error) {
			next(error);
		}
	}

	// Request OTP
	async requestOTP(req: Request, res: Response, next: NextFunction) {
		try {
			const { email, channel, phone, whatsapp } = req.body as RequestOTPInput;

			const user = await prisma.user.findUnique({ where: { email } });
			if (!user) {
				return this.notFound(res, "User");
			}

			const code = await createAndStoreOTP(user.id, channel);

			// Send OTP based on channel
			try {
				switch (channel) {
					case "EMAIL":
						await sendEmailOTP(email, code);
						break;
					case "SMS":
						if (!phone && !user.phone) {
							return this.error(res, "Phone number is required for SMS", 400);
						}
						await sendSmsOTP(phone || user.phone!, code);
						break;
					case "WHATSAPP":
						if (!whatsapp && !user.phone) {
							return this.error(res, "WhatsApp number is required", 400);
						}
						await sendWhatsAppOTP(whatsapp || user.phone!, code);
						break;
					default:
						return this.error(res, "Invalid channel", 400);
				}
			} catch (sendError: any) {
				return this.error(
					res,
					`Failed to send OTP via ${channel}: ${sendError.message}`,
					500
				);
			}

			return this.success(res, null, `OTP sent successfully via ${channel}`);
		} catch (error) {
			next(error);
		}
	}

	// Verify OTP
	async verifyOTP(req: Request, res: Response, next: NextFunction) {
		try {
			const { email, code, channel } = req.body as VerifyOTPInput;

			const user = await prisma.user.findUnique({ where: { email } });
			if (!user) {
				return this.notFound(res, "User");
			}

			const isValid = await verifyOTP(user.id, code, channel);
			if (!isValid) {
				return this.error(res, "Invalid or expired OTP code", 400);
			}

			// Mark user as verified if not already
			if (!user.isVerified) {
				await prisma.user.update({
					where: { id: user.id },
					data: { isVerified: true },
				});
			}

			return this.success(res, { verified: true }, "OTP verified successfully");
		} catch (error) {
			next(error);
		}
	}
}

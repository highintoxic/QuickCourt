import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";

// Extend Request interface to include user
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				email: string;
				role: string;
				isVerified: boolean;
			};
		}
	}
}

// User roles enum
export enum UserRole {
	USER = "USER",
	ADMIN = "ADMIN",
	FACILITY_OWNER = "FACILITY_OWNER",
}

// JWT token payload interface
interface TokenPayload {
	userId: string;
	email: string;
	role: string;
	iat?: number;
	exp?: number;
}

// Authentication middleware
export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return res.status(401).json({
				success: false,
				message: "No authorization header provided",
			});
		}

		const token = authHeader.split(" ")[1]; // Bearer <token>

		if (!token) {
			return res.status(401).json({
				success: false,
				message: "No token provided",
			});
		}

		// Verify JWT token
		const decoded = jwt.verify(token, env.jwt.accessSecret) as TokenPayload;

		// Get user from database
		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			select: {
				id: true,
				email: true,
				isVerified: true,
			},
		});

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "User not found",
			});
		}

		// Add user to request (we'll get role from token for now)
		req.user = {
			...user,
			role: decoded.role,
		};
		next();
	} catch (error: any) {
		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({
				success: false,
				message: "Invalid token",
			});
		}

		if (error.name === "TokenExpiredError") {
			return res.status(401).json({
				success: false,
				message: "Token expired",
			});
		}

		return res.status(500).json({
			success: false,
			message: "Authentication error",
		});
	}
};

// Role-based authorization middleware factory
export const authorize = (...allowedRoles: UserRole[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: "User not authenticated",
			});
		}

		if (!allowedRoles.includes(req.user.role as UserRole)) {
			return res.status(403).json({
				success: false,
				message: "Insufficient permissions",
			});
		}

		next();
	};
};

// Specific role middleware
export const requireUser = authorize(
	UserRole.USER,
	UserRole.ADMIN,
	UserRole.FACILITY_OWNER
);
export const requireAdmin = authorize(UserRole.ADMIN);
export const requireFacilityOwner = authorize(
	UserRole.FACILITY_OWNER,
	UserRole.ADMIN
);

// Check if user is verified
export const requireVerified = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!req.user) {
		return res.status(401).json({
			success: false,
			message: "User not authenticated",
		});
	}

	if (!req.user.isVerified) {
		return res.status(403).json({
			success: false,
			message: "Please verify your account to access this resource",
		});
	}

	next();
};

// Check if user owns resource or is admin
export const requireOwnershipOrAdmin = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!req.user) {
		return res.status(401).json({
			success: false,
			message: "User not authenticated",
		});
	}

	// Admins can access everything
	if (req.user.role === UserRole.ADMIN) {
		return next();
	}

	// Check if user owns the resource (implement based on your needs)
	const resourceUserId = req.params.userId || req.body.userId;

	if (req.user.id !== resourceUserId) {
		return res.status(403).json({
			success: false,
			message: "You can only access your own resources",
		});
	}

	next();
};

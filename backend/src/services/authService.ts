import { prisma } from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import ms from "ms";
import crypto from "crypto";

export async function register(
	email: string,
	password: string,
	phone?: string,
	role: string = "USER"
) {
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) throw new Error("Email already registered");
	const passwordHash = await bcrypt.hash(password, 10);
	return prisma.user.create({
		data: {
			email,
			passwordHash,
			phone,
			role: role as any, // Temporary fix until Prisma client is regenerated
		},
	});
}

export async function authenticate(email: string, password: string) {
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) throw new Error("Invalid credentials");
	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) throw new Error("Invalid credentials");
	return generateTokens(user.id);
}

export interface TokenPair {
	accessToken: string;
	refreshToken: string;
	refreshTokenId: string; // jti
}

function calcExpiry(duration: string) {
	// Parse duration strings like "15m", "7d", "1h"
	const match = duration.match(/^(\d+)([smhd])$/);
	if (!match) throw new Error(`Invalid duration format: ${duration}`);

	const value = parseInt(match[1], 10);
	const unit = match[2];

	let milliseconds: number;
	switch (unit) {
		case "s":
			milliseconds = value * 1000;
			break;
		case "m":
			milliseconds = value * 60 * 1000;
			break;
		case "h":
			milliseconds = value * 60 * 60 * 1000;
			break;
		case "d":
			milliseconds = value * 24 * 60 * 60 * 1000;
			break;
		default:
			throw new Error(`Unsupported time unit: ${unit}`);
	}

	return new Date(Date.now() + milliseconds);
}

export async function generateTokens(userId: string): Promise<TokenPair> {
	// Get user details including role
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			email: true,
			role: true,
			isVerified: true,
		},
	});

	if (!user) {
		throw new Error("User not found");
	}

	const refreshTokenId = crypto.randomUUID();
	if (!env.jwt.accessSecret) {
		throw new Error("JWT secret is required");
	}

	// Include user details in access token
	//@ts-ignore
	const accessToken = jwt.sign(
		{
			userId: user.id,
			email: user.email,
			role: user.role,
			isVerified: user.isVerified,
			jti: crypto.randomUUID(),
		},
		env.jwt.accessSecret,
		{ expiresIn: env.jwt.expiresIn as string }
	);

	// Refresh token with minimal info
	//@ts-ignore
	const refreshToken = jwt.sign(
		{
			userId: user.id,
			jti: refreshTokenId,
			type: "refresh",
		},
		env.jwt.refreshSecret,
		{ expiresIn: env.jwt.refreshExpiresIn as string }
	);

	await prisma.refreshToken.create({
		data: {
			id: refreshTokenId,
			userId,
			expiresAt: calcExpiry(env.jwt.refreshExpiresIn),
		},
	});

	return { accessToken, refreshToken, refreshTokenId };
}

export async function rotateRefreshToken(oldToken: string): Promise<TokenPair> {
	let payload: any;
	try {
		payload = jwt.verify(oldToken, env.jwt.refreshSecret);
	} catch {
		throw new Error("Invalid refresh token");
	}
	if (payload.type !== "refresh") throw new Error("Invalid token type");

	const record = await prisma.refreshToken.findUnique({
		where: { id: payload.jti },
	});
	if (!record) throw new Error("Token not found");
	if (record.revokedAt) throw new Error("Token revoked");
	if (record.expiresAt < new Date()) throw new Error("Token expired");
	if (record.replacedBy) {
		// reuse detection -> revoke all for user
		await prisma.refreshToken.updateMany({
			where: { userId: record.userId, revokedAt: null },
			data: { revokedAt: new Date() },
		});
		throw new Error("Refresh token reuse detected");
	}

	// generate new and link
	const newPair = await generateTokens(record.userId);
	await prisma.refreshToken.update({
		where: { id: record.id },
		data: { revokedAt: new Date(), replacedBy: newPair.refreshTokenId },
	});
	return newPair;
}

export async function revokeRefreshToken(refreshTokenId: string) {
	await prisma.refreshToken.updateMany({
		where: { id: refreshTokenId, revokedAt: null },
		data: { revokedAt: new Date() },
	});
}

export async function revokeAllUserTokens(userId: string) {
	await prisma.refreshToken.updateMany({
		where: { userId, revokedAt: null },
		data: { revokedAt: new Date() },
	});
}

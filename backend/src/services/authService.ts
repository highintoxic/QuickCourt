import { prisma } from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import ms from "ms";
import crypto from "crypto";

export async function register(
	email: string,
	password: string,
	phone?: string
) {
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) throw new Error("Email already registered");
	const passwordHash = await bcrypt.hash(password, 10);
	return prisma.user.create({ data: { email, passwordHash, phone } });
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
	const msVal = ms(duration);
	return new Date(Date.now() + msVal);
}

export async function generateTokens(userId: string): Promise<TokenPair> {
	const refreshTokenId = crypto.randomUUID();
	const accessToken = jwt.sign(
		{ sub: userId, jti: crypto.randomUUID() },
		env.jwt.accessSecret,
		{ expiresIn: env.jwt.expiresIn }
	);
	const refreshToken = jwt.sign(
		{ sub: userId, jti: refreshTokenId, type: "refresh" },
		env.jwt.refreshSecret,
		{ expiresIn: env.jwt.refreshExpiresIn }
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

	const record = await prisma.refreshToken.findUnique({ where: { id: payload.jti } });
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

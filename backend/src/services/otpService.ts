import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import crypto from "crypto";

export function generateOTP(length = env.otp.length) {
	const digits = "0123456789";
	let code = "";
	for (let i = 0; i < length; i++)
		code += digits[Math.floor(Math.random() * digits.length)];
	return code;
}

export async function createAndStoreOTP(
	userId: string,
	channel: "EMAIL" | "SMS" | "WHATSAPP"
) {
	const code = generateOTP();

	const windowStart = new Date(
		Date.now() - env.otp.rateLimitWindowMinutes * 60 * 1000
	);
	const recentCount = await prisma.oTP.count({
		where: { userId, channel, createdAt: { gte: windowStart } },
	});
	if (recentCount >= env.otp.rateLimitMax)
		throw new Error("Too many OTP requests. Please try later.");

	const expiresAt = new Date(Date.now() + env.otp.expMinutes * 60 * 1000);
	await prisma.oTP.create({ data: { userId, channel, code, expiresAt } });
	return code;
}

export async function verifyOTP(
	userId: string,
	code: string,
	channel: "EMAIL" | "SMS" | "WHATSAPP"
) {
	const otp = await prisma.oTP.findFirst({
		where: {
			userId,
			channel,
			code,
			consumedAt: null,
			expiresAt: { gt: new Date() },
		},
		orderBy: { createdAt: "desc" },
	});
	if (!otp) return false;
	await prisma.oTP.update({
		where: { id: otp.id },
		data: { consumedAt: new Date() },
	});
	return true;
}

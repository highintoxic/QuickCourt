import { Router } from "express";
import {
	register,
	authenticate,
	generateTokens,
	rotateRefreshToken,
	revokeRefreshToken,
	revokeAllUserTokens,
} from "../services/authService.js";
import { createAndStoreOTP, verifyOTP } from "../services/otpService.js";
import { sendEmailOTP } from "../services/emailService.js";
import { sendSmsOTP, sendWhatsAppOTP } from "../services/smsService.js";
import { prisma } from "../config/prisma.js";

const router = Router();

router.post("/register", async (req, res, next) => {
	try {
		const { email, password, phone } = req.body;
		const user = await register(email, password, phone);
		res.json({ user });
	} catch (e) {
		next(e);
	}
});

router.post("/login", async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const tokens = await authenticate(email, password);
		res.json(tokens);
	} catch (e) {
		next(e);
	}
});

router.post("/token/refresh", async (req, res, next) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) throw new Error("Missing refresh token");
		const tokens = await rotateRefreshToken(refreshToken);
		res.json(tokens);
	} catch (e) {
		next(e);
	}
});

router.post("/logout", async (req, res, next) => {
	try {
		const { refreshTokenId } = req.body; // client stores id returned at issuance
		if (!refreshTokenId) throw new Error("Missing refreshTokenId");
		await revokeRefreshToken(refreshTokenId);
		res.json({ message: "Logged out" });
	} catch (e) {
		next(e);
	}
});

router.post("/logout/all", async (req, res, next) => {
	try {
		const { userId } = req.body; // or derive from auth context
		if (!userId) throw new Error("Missing userId");
		await revokeAllUserTokens(userId);
		res.json({ message: "All sessions revoked" });
	} catch (e) {
		next(e);
	}
});

router.post("/otp/request", async (req, res, next) => {
	try {
		const { email, channel = "EMAIL", phone, whatsapp } = req.body;
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) throw new Error("User not found");
		const code = await createAndStoreOTP(user.id, channel);
		if (channel === "EMAIL") await sendEmailOTP(email, code);
		if (channel === "SMS") {
			if (!phone && !user.phone) throw new Error("No phone provided");
			await sendSmsOTP(phone || user.phone!, code);
		}
		if (channel === "WHATSAPP") {
			if (!whatsapp && !user.phone)
				throw new Error("No WhatsApp number provided");
			await sendWhatsAppOTP(whatsapp || user.phone!, code);
		}
		res.json({ message: "OTP sent" });
	} catch (e) {
		next(e);
	}
});

router.post("/otp/verify", async (req, res, next) => {
	try {
		const { email, code, channel = "EMAIL" } = req.body;
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) throw new Error("User not found");
		const ok = await verifyOTP(user.id, code, channel);
		if (!ok)
			return res.status(400).json({ message: "Invalid or expired code" });
		if (!user.isVerified)
			await prisma.user.update({
				where: { id: user.id },
				data: { isVerified: true },
			});
		res.json({ message: "Verified" });
	} catch (e) {
		next(e);
	}
});

export default router;

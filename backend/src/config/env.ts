import dotenv from "dotenv";
dotenv.config();

export const env = {
	port: parseInt(process.env.PORT || "4000", 10),
	nodeEnv: process.env.NODE_ENV || "development",
	jwt: {
		// legacy combined secret still supported as fallback
		secret: process.env.JWT_SECRET || "changeme",
		// new separate secrets
		accessSecret:
			process.env.JWT_ACCESS_SECRET ||
			process.env.JWT_SECRET ||
			"changeme_access",
		refreshSecret:
			process.env.JWT_REFRESH_SECRET ||
			process.env.JWT_SECRET ||
			"changeme_refresh",
		expiresIn:
			process.env.JWT_ACCESS_EXPIRES || process.env.JWT_EXPIRES_IN || "15m",
		refreshExpiresIn:
			process.env.JWT_REFRESH_EXPIRES ||
			process.env.JWT_REFRESH_EXPIRES_IN ||
			"7d",
	},
	dbUrl: process.env.DATABASE_URL!,
	redis: {
		host: process.env.REDIS_HOST || "localhost",
		port: parseInt(process.env.REDIS_PORT || "6379", 10),
		password: process.env.REDIS_PASSWORD || undefined,
		db: parseInt(process.env.REDIS_DB || "0", 10),
		url: process.env.REDIS_URL || undefined,
	},
	email: {
		host: process.env.SMTP_HOST!,
		port: parseInt(process.env.SMTP_PORT || "587", 10),
		user: process.env.SMTP_USER!,
		pass: process.env.SMTP_PASS!,
		from: process.env.FROM_EMAIL || "no-reply@example.com",
	},
	twilio: {
		accountSid: process.env.TWILIO_ACCOUNT_SID || "",
		authToken: process.env.TWILIO_AUTH_TOKEN || "",
		messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || "",
		whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || "",
	},
	otp: {
		length: parseInt(process.env.OTP_LENGTH || "6", 10),
		expMinutes: parseInt(process.env.OTP_EXP_MINUTES || "10", 10),
		rateLimitWindowMinutes: parseInt(
			process.env.RATE_LIMIT_WINDOW_MINUTES || "15",
			10
		),
		rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_OTPS || "5", 10),
	},
};

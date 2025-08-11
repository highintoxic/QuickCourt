import { z } from "zod";

// Common validation patterns
const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
const strongPasswordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Auth validation schemas
export const registerSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(
			strongPasswordRegex,
			"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
		),
	phone: z.string().regex(phoneRegex, "Invalid phone number format").optional(),
	role: z.enum(["USER", "ADMIN", "FACILITY_OWNER"]).default("USER").optional(),
});

export const loginSchema = z.object({
	email: z.string().email("Invalid email format"),
	password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
	refreshToken: z.string().min(1, "Refresh token is required"),
});

export const logoutSchema = z.object({
	refreshTokenId: z.string().min(1, "Refresh token ID is required"),
});

export const logoutAllSchema = z.object({
	userId: z.string().min(1, "User ID is required"),
});

export const requestOTPSchema = z
	.object({
		email: z.string().email("Invalid email format"),
		channel: z.enum(["EMAIL", "SMS", "WHATSAPP"]).default("EMAIL"),
		phone: z
			.string()
			.regex(phoneRegex, "Invalid phone number format")
			.optional(),
		whatsapp: z
			.string()
			.regex(phoneRegex, "Invalid WhatsApp number format")
			.optional(),
	})
	.refine(
		(data) => {
			if (data.channel === "SMS" && !data.phone) {
				return false;
			}
			if (data.channel === "WHATSAPP" && !data.whatsapp) {
				return false;
			}
			return true;
		},
		{
			message:
				"Phone number is required for SMS, WhatsApp number is required for WhatsApp",
		}
	);

export const verifyOTPSchema = z.object({
	email: z.string().email("Invalid email format"),
	code: z
		.string()
		.min(4, "OTP code must be at least 4 characters")
		.max(8, "OTP code must be at most 8 characters"),
	channel: z.enum(["EMAIL", "SMS", "WHATSAPP"]).default("EMAIL"),
});

// Common parameter validation schemas
export const idParamSchema = z.object({
	id: z.string().uuid("Invalid ID format"),
});

export const paginationQuerySchema = z.object({
	page: z
		.string()
		.regex(/^\d+$/, "Page must be a number")
		.transform(Number)
		.optional()
		.default("1"),
	limit: z
		.string()
		.regex(/^\d+$/, "Limit must be a number")
		.transform(Number)
		.optional()
		.default("10"),
	sort: z.string().optional(),
	order: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Type inference from schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type LogoutAllInput = z.infer<typeof logoutAllSchema>;
export type RequestOTPInput = z.infer<typeof requestOTPSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type IdParamInput = z.infer<typeof idParamSchema>;
export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;

// Admin validation schemas
export const updateUserRoleSchema = z.object({
	role: z.enum(["USER", "ADMIN", "FACILITY_OWNER"], {
		errorMap: () => ({
			message: "Role must be USER, ADMIN, or FACILITY_OWNER",
		}),
	}),
});

// Facility validation schemas
export const createFacilitySchema = z.object({
	name: z.string().min(2, "Facility name must be at least 2 characters"),
	description: z.string().optional(),
	address: z.string().min(5, "Address must be at least 5 characters"),
	phone: z.string().regex(phoneRegex, "Invalid phone number format").optional(),
	email: z.string().email("Invalid email format").optional(),
});

export const updateFacilitySchema = z.object({
	name: z
		.string()
		.min(2, "Facility name must be at least 2 characters")
		.optional(),
	description: z.string().optional(),
	address: z
		.string()
		.min(5, "Address must be at least 5 characters")
		.optional(),
	phone: z.string().regex(phoneRegex, "Invalid phone number format").optional(),
	email: z.string().email("Invalid email format").optional(),
	isActive: z.boolean().optional(),
});

// Court validation schemas
export const createCourtSchema = z.object({
	name: z.string().min(2, "Court name must be at least 2 characters"),
	description: z.string().optional(),
	venueType: z.enum([
		"TENNIS",
		"BADMINTON",
		"SQUASH",
		"TABLE_TENNIS",
		"BASKETBALL",
		"VOLLEYBALL",
		"FOOTBALL",
		"OTHER",
	]),
	pricePerHour: z.number().positive("Price must be a positive number"),
	isActive: z.boolean().default(true).optional(),
});

export const updateCourtSchema = z.object({
	name: z
		.string()
		.min(2, "Court name must be at least 2 characters")
		.optional(),
	description: z.string().optional(),
	venueType: z
		.enum([
			"TENNIS",
			"BADMINTON",
			"SQUASH",
			"TABLE_TENNIS",
			"BASKETBALL",
			"VOLLEYBALL",
			"FOOTBALL",
			"OTHER",
		])
		.optional(),
	pricePerHour: z
		.number()
		.positive("Price must be a positive number")
		.optional(),
	isActive: z.boolean().optional(),
});

// Booking validation schemas
export const createBookingSchema = z
	.object({
		courtId: z.string().uuid("Invalid court ID format"),
		startTime: z.string().datetime("Invalid start time format"),
		endTime: z.string().datetime("Invalid end time format"),
		notes: z.string().optional(),
	})
	.refine(
		(data) => {
			const start = new Date(data.startTime);
			const end = new Date(data.endTime);
			return end > start;
		},
		{
			message: "End time must be after start time",
		}
	);

export const updateBookingStatusSchema = z.object({
	status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

// Payment validation schemas
export const createPaymentSchema = z.object({
	bookingId: z.string().uuid("Invalid booking ID format"),
	amount: z.number().positive("Amount must be positive"),
	paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "UPI", "WALLET", "CASH"]),
	transactionId: z.string().optional(),
});

// Review validation schemas
export const createReviewSchema = z.object({
	facilityId: z.string().uuid("Invalid facility ID format"),
	rating: z
		.number()
		.min(1, "Rating must be at least 1")
		.max(5, "Rating must be at most 5"),
	comment: z
		.string()
		.min(5, "Comment must be at least 5 characters")
		.optional(),
});

export const updateReviewSchema = z.object({
	rating: z
		.number()
		.min(1, "Rating must be at least 1")
		.max(5, "Rating must be at most 5")
		.optional(),
	comment: z
		.string()
		.min(5, "Comment must be at least 5 characters")
		.optional(),
});

// Search and filter schemas
export const searchFacilitiesSchema = z.object({
	query: z.string().optional(),
	venueType: z
		.enum([
			"TENNIS",
			"BADMINTON",
			"SQUASH",
			"TABLE_TENNIS",
			"BASKETBALL",
			"VOLLEYBALL",
			"FOOTBALL",
			"OTHER",
		])
		.optional(),
	minPrice: z.number().positive().optional(),
	maxPrice: z.number().positive().optional(),
	city: z.string().optional(),
	isActive: z.boolean().optional(),
	page: z.number().positive().optional().default(1),
	limit: z.number().positive().max(100).optional().default(10),
});

export const availabilityCheckSchema = z.object({
	facilityId: z.string().uuid("Invalid facility ID format"),
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
	startTime: z
		.string()
		.regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
	endTime: z
		.string()
		.regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
});

// Additional type exports
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;
export type CreateCourtInput = z.infer<typeof createCourtSchema>;
export type UpdateCourtInput = z.infer<typeof updateCourtSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<
	typeof updateBookingStatusSchema
>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type SearchFacilitiesInput = z.infer<typeof searchFacilitiesSchema>;
export type AvailabilityCheckInput = z.infer<typeof availabilityCheckSchema>;

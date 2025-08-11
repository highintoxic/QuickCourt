import { Router } from "express";
import { BookingController } from "../controllers/BookingController.js";
import { authenticate, authorize, UserRole } from "../middleware/rbac.js";
import {
	validateRequest,
	validateQuery,
	validateParams,
} from "../middleware/validation.js";
import {
	createBookingSchema,
	updateBookingStatusSchema,
	idParamSchema,
	availabilityCheckSchema,
} from "../utils/validation.js";

const router = Router();
const bookingController = new BookingController();

// All routes require authentication
router.use(authenticate);

// Create booking (any authenticated user)
router.post(
	"/",
	validateRequest(createBookingSchema),
	bookingController.createBooking.bind(bookingController)
);

// Get user's bookings
router.get(
	"/my-bookings",
	bookingController.getUserBookings.bind(bookingController)
);

// Check availability
router.get(
	"/availability",
	validateQuery(availabilityCheckSchema),
	bookingController.checkAvailability.bind(bookingController)
);

// Get booking by ID
router.get(
	"/:id",
	validateParams(idParamSchema),
	bookingController.getBookingById.bind(bookingController)
);

// Update booking status (facility owners and admins only)
router.patch(
	"/:id/status",
	authorize(UserRole.ADMIN, UserRole.FACILITY_OWNER),
	validateParams(idParamSchema),
	validateRequest(updateBookingStatusSchema),
	bookingController.updateBookingStatus.bind(bookingController)
);

// Cancel booking (booking owner only)
router.patch(
	"/:id/cancel",
	validateParams(idParamSchema),
	bookingController.cancelBooking.bind(bookingController)
);

// Get facility bookings (facility owners and admins only)
router.get(
	"/facility/:id",
	authorize(UserRole.ADMIN, UserRole.FACILITY_OWNER),
	validateParams(idParamSchema),
	bookingController.getFacilityBookings.bind(bookingController)
);

export default router;

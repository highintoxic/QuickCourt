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

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Booking ID
 *         userId:
 *           type: string
 *           description: ID of the user who made the booking
 *         courtId:
 *           type: string
 *           description: ID of the booked court
 *         startsAt:
 *           type: string
 *           format: date-time
 *           description: Booking start time
 *         endsAt:
 *           type: string
 *           format: date-time
 *           description: Booking end time
 *         hours:
 *           type: number
 *           format: float
 *           description: Duration in hours
 *         unitPrice:
 *           type: number
 *           format: decimal
 *           description: Price per hour
 *         totalAmount:
 *           type: number
 *           format: decimal
 *           description: Total booking amount
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *           description: Booking status
 *         paymentStatus:
 *           type: string
 *           enum: [UNPAID, PAID, FAILED, REFUNDED]
 *           description: Payment status
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             fullName:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *         court:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             pricePerHour:
 *               type: number
 *             facility:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *             sport:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *         payment:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             status:
 *               type: string
 *             amount:
 *               type: number
 *
 *     CreateBookingRequest:
 *       type: object
 *       required:
 *         - courtId
 *         - startsAt
 *         - endsAt
 *       properties:
 *         courtId:
 *           type: string
 *           description: ID of the court to book
 *         startsAt:
 *           type: string
 *           format: date-time
 *           description: Booking start time
 *           example: "2025-08-12T10:00:00.000Z"
 *         endsAt:
 *           type: string
 *           format: date-time
 *           description: Booking end time
 *           example: "2025-08-12T12:00:00.000Z"
 *         notes:
 *           type: string
 *           maxLength: 500
 *           description: Optional booking notes
 *
 *     UpdateBookingStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *           description: New booking status
 *         reason:
 *           type: string
 *           maxLength: 500
 *           description: Reason for status change (required for cancellation)
 *
 *     AvailabilityCheck:
 *       type: object
 *       properties:
 *         court:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             opensAt:
 *               type: string
 *             closesAt:
 *               type: string
 *         date:
 *           type: string
 *           format: date
 *         timeSlots:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               available:
 *                 type: boolean
 *               price:
 *                 type: number
 *                 format: decimal
 *         summary:
 *           type: object
 *           properties:
 *             totalSlots:
 *               type: integer
 *             availableSlots:
 *               type: integer
 *             bookedSlots:
 *               type: integer
 */

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Create a booking for a court at a specific time
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingRequest'
 *           example:
 *             courtId: "clxxxxx"
 *             startsAt: "2025-08-12T10:00:00.000Z"
 *             endsAt: "2025-08-12T12:00:00.000Z"
 *             notes: "Team practice session"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid booking data or time slot unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               timeSlotTaken:
 *                 summary: Time slot already booked
 *                 value:
 *                   message: "Time slot is not available"
 *               pastTime:
 *                 summary: Booking in the past
 *                 value:
 *                   message: "Cannot book time slots in the past"
 *               outsideOperatingHours:
 *                 summary: Outside operating hours
 *                 value:
 *                   message: "Booking time is outside court operating hours"
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Court not found
 *       500:
 *         description: Internal server error
 */
router.post(
	"/",
	validateRequest(createBookingSchema),
	bookingController.createBooking.bind(bookingController)
);

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Get user's bookings
 *     description: Retrieve all bookings made by the authenticated user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *         description: Filter by booking status
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Show only upcoming bookings
 *     responses:
 *       200:
 *         description: User bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Internal server error
 */
router.get(
	"/my-bookings",
	bookingController.getUserBookings.bind(bookingController)
);

/**
 * @swagger
 * /api/bookings/availability:
 *   get:
 *     summary: Check court availability
 *     description: Check availability of courts for a specific date and facility
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID to check availability for
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check availability (YYYY-MM-DD)
 *         example: "2025-08-12"
 *       - in: query
 *         name: sportId
 *         schema:
 *           type: string
 *         description: Filter by sport type
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         description: Start time filter (HH:MM)
 *       - in: query
 *         name: endTime
 *         schema:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         description: End time filter (HH:MM)
 *     responses:
 *       200:
 *         description: Availability data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AvailabilityCheck'
 *       400:
 *         description: Invalid query parameters
 *       404:
 *         description: Facility not found
 *       500:
 *         description: Internal server error
 */
router.get(
	"/availability",
	validateQuery(availabilityCheckSchema),
	bookingController.checkAvailability.bind(bookingController)
);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     description: Retrieve detailed information about a specific booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - can only view own bookings or if facility owner/admin
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.get(
	"/:id",
	validateParams(idParamSchema),
	bookingController.getBookingById.bind(bookingController)
);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status
 *     description: Update the status of a booking (facility owners and admins only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBookingStatusRequest'
 *           examples:
 *             confirmBooking:
 *               summary: Confirm booking
 *               value:
 *                 status: "CONFIRMED"
 *             cancelBooking:
 *               summary: Cancel booking
 *               value:
 *                 status: "CANCELLED"
 *                 reason: "Court maintenance required"
 *             completeBooking:
 *               summary: Complete booking
 *               value:
 *                 status: "COMPLETED"
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid status transition or missing reason
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - facility owners and admins only
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.patch(
	"/:id/status",
	authorize(UserRole.ADMIN, UserRole.FACILITY_OWNER),
	validateParams(idParamSchema),
	validateRequest(updateBookingStatusSchema),
	bookingController.updateBookingStatus.bind(bookingController)
);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel booking
 *     description: Cancel a booking (booking owner only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Reason for cancellation
 *           example:
 *             reason: "Schedule conflict"
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking cancelled successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Cannot cancel booking (e.g., already started or too late)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               alreadyStarted:
 *                 summary: Booking already started
 *                 value:
 *                   message: "Cannot cancel booking that has already started"
 *               alreadyCancelled:
 *                 summary: Already cancelled
 *                 value:
 *                   message: "Booking is already cancelled"
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - can only cancel own bookings
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.patch(
	"/:id/cancel",
	validateParams(idParamSchema),
	bookingController.cancelBooking.bind(bookingController)
);

/**
 * @swagger
 * /api/bookings/facility/{id}:
 *   get:
 *     summary: Get facility bookings
 *     description: Retrieve all bookings for a specific facility (facility owners and admins only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *         description: Filter by booking status
 *       - in: query
 *         name: courtId
 *         schema:
 *           type: string
 *         description: Filter by specific court
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Show only upcoming bookings
 *     responses:
 *       200:
 *         description: Facility bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalBookings:
 *                       type: integer
 *                     revenue:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         thisMonth:
 *                           type: number
 *                     statusBreakdown:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - facility owners and admins only
 *       404:
 *         description: Facility not found
 *       500:
 *         description: Internal server error
 */
router.get(
	"/facility/:id",
	authorize(UserRole.ADMIN, UserRole.FACILITY_OWNER),
	validateParams(idParamSchema),
	bookingController.getFacilityBookings.bind(bookingController)
);

export default router;

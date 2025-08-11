import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { CourtController } from "../controllers/CourtController";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Court:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Court ID
 *         facilityId:
 *           type: string
 *           description: ID of the facility this court belongs to
 *         name:
 *           type: string
 *           description: Court name
 *         sportId:
 *           type: string
 *           description: ID of the sport this court is for
 *         pricePerHour:
 *           type: number
 *           format: decimal
 *           description: Price per hour in currency units
 *         opensAt:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Opening time in HH:MM format
 *         closesAt:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Closing time in HH:MM format
 *         isActive:
 *           type: boolean
 *           description: Whether the court is active
 *         sport:
 *           $ref: '#/components/schemas/Sport'
 *         facility:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             ownerId:
 *               type: string
 *         _count:
 *           type: object
 *           properties:
 *             bookings:
 *               type: integer
 *             unavailabilities:
 *               type: integer
 *
 *     Sport:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Sport ID
 *         name:
 *           type: string
 *           description: Sport name
 *         icon:
 *           type: string
 *           description: Sport icon URL or identifier
 *         _count:
 *           type: object
 *           properties:
 *             courts:
 *               type: integer
 *
 *     CreateCourtRequest:
 *       type: object
 *       required:
 *         - name
 *         - sportId
 *         - pricePerHour
 *         - opensAt
 *         - closesAt
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         sportId:
 *           type: string
 *         pricePerHour:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *         opensAt:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           example: "09:00"
 *         closesAt:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           example: "22:00"
 *         isActive:
 *           type: boolean
 *           default: true
 *
 *     UpdateCourtRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         sportId:
 *           type: string
 *         pricePerHour:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *         opensAt:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         closesAt:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         isActive:
 *           type: boolean
 *
 *     CourtUnavailability:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         courtId:
 *           type: string
 *         startsAt:
 *           type: string
 *           format: date-time
 *         endsAt:
 *           type: string
 *           format: date-time
 *         reason:
 *           type: string
 *           enum: [MAINTENANCE, BLOCKED, OTHER]
 *
 *     CreateCourtUnavailabilityRequest:
 *       type: object
 *       required:
 *         - startsAt
 *         - endsAt
 *         - reason
 *       properties:
 *         startsAt:
 *           type: string
 *           format: date-time
 *         endsAt:
 *           type: string
 *           format: date-time
 *         reason:
 *           type: string
 *           enum: [MAINTENANCE, BLOCKED, OTHER]
 *
 *     CourtAvailability:
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
 *         summary:
 *           type: object
 *           properties:
 *             totalSlots:
 *               type: integer
 *             availableSlots:
 *               type: integer
 *             bookedSlots:
 *               type: integer
 *
 *     CreateSportRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *         icon:
 *           type: string
 *           description: URL or identifier for sport icon
 */

/**
 * @swagger
 * /api/courts/facility/{facilityId}:
 *   get:
 *     summary: Get all courts for a facility
 *     description: Retrieve all courts belonging to a specific facility with optional filtering
 *     tags: [Courts]
 *     parameters:
 *       - in: path
 *         name: facilityId
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
 *         name: sportId
 *         schema:
 *           type: string
 *         description: Filter by sport
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Courts retrieved successfully
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
 *                     $ref: '#/components/schemas/Court'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Internal server error
 */
router.get("/facility/:facilityId", CourtController.getCourtsByFacility);

/**
 * @swagger
 * /api/courts/{courtId}:
 *   get:
 *     summary: Get court by ID
 *     description: Retrieve detailed information about a specific court
 *     tags: [Courts]
 *     parameters:
 *       - in: path
 *         name: courtId
 *         required: true
 *         schema:
 *           type: string
 *         description: Court ID
 *     responses:
 *       200:
 *         description: Court retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Court'
 *       404:
 *         description: Court not found
 *       500:
 *         description: Internal server error
 */
router.get("/:courtId", CourtController.getCourtById);

/**
 * @swagger
 * /api/courts/facility/{facilityId}:
 *   post:
 *     summary: Create a new court
 *     description: Create a new court in a facility (facility owners only)
 *     tags: [Courts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourtRequest'
 *           example:
 *             name: "Court 1"
 *             sportId: "clxxxxx"
 *             pricePerHour: 500.00
 *             opensAt: "06:00"
 *             closesAt: "23:00"
 *             isActive: true
 *     responses:
 *       201:
 *         description: Court created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Court'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied
 *       404:
 *         description: Facility or sport not found
 *       409:
 *         description: Court name already exists in facility
 *       500:
 *         description: Internal server error
 */
router.post("/facility/:facilityId", requireAuth, CourtController.createCourt);

/**
 * @swagger
 * /api/courts/{courtId}:
 *   put:
 *     summary: Update court details
 *     description: Update court information (facility owners only)
 *     tags: [Courts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courtId
 *         required: true
 *         schema:
 *           type: string
 *         description: Court ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCourtRequest'
 *           example:
 *             name: "Updated Court Name"
 *             pricePerHour: 600.00
 *             isActive: false
 *     responses:
 *       200:
 *         description: Court updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Court'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied
 *       404:
 *         description: Court or sport not found
 *       409:
 *         description: Court name already exists in facility
 *       500:
 *         description: Internal server error
 */
router.put("/:courtId", requireAuth, CourtController.updateCourt);

/**
 * @swagger
 * /api/courts/{courtId}:
 *   delete:
 *     summary: Delete court
 *     description: Delete a court (facility owners only). Cannot delete courts with future bookings.
 *     tags: [Courts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courtId
 *         required: true
 *         schema:
 *           type: string
 *         description: Court ID
 *     responses:
 *       200:
 *         description: Court deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Cannot delete court with future bookings
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied
 *       404:
 *         description: Court not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:courtId", requireAuth, CourtController.deleteCourt);

/**
 * @swagger
 * /api/courts/{courtId}/availability:
 *   get:
 *     summary: Get court availability
 *     description: Check availability of a court for a specific date and time range
 *     tags: [Courts]
 *     parameters:
 *       - in: path
 *         name: courtId
 *         required: true
 *         schema:
 *           type: string
 *         description: Court ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check availability (YYYY-MM-DD)
 *         example: "2025-08-12"
 *       - in: query
 *         name: startTime
 *         schema:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         description: Start time filter (HH:MM)
 *         example: "09:00"
 *       - in: query
 *         name: endTime
 *         schema:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *         description: End time filter (HH:MM)
 *         example: "18:00"
 *     responses:
 *       200:
 *         description: Court availability retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CourtAvailability'
 *             example:
 *               message: "Court availability retrieved successfully"
 *               data:
 *                 court:
 *                   id: "clxxxxx"
 *                   name: "Court 1"
 *                   opensAt: "06:00"
 *                   closesAt: "23:00"
 *                 date: "2025-08-12"
 *                 timeSlots:
 *                   - startTime: "2025-08-12T06:00:00.000Z"
 *                     endTime: "2025-08-12T07:00:00.000Z"
 *                     available: true
 *                   - startTime: "2025-08-12T07:00:00.000Z"
 *                     endTime: "2025-08-12T08:00:00.000Z"
 *                     available: false
 *                 summary:
 *                   totalSlots: 17
 *                   availableSlots: 12
 *                   bookedSlots: 5
 *       400:
 *         description: Invalid date or court inactive
 *       404:
 *         description: Court not found
 *       500:
 *         description: Internal server error
 */
router.get("/:courtId/availability", CourtController.getCourtAvailability);

/**
 * @swagger
 * /api/courts/{courtId}/unavailability:
 *   post:
 *     summary: Create court unavailability
 *     description: Block a court for maintenance or other reasons (facility owners only)
 *     tags: [Courts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courtId
 *         required: true
 *         schema:
 *           type: string
 *         description: Court ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourtUnavailabilityRequest'
 *           example:
 *             startsAt: "2025-08-15T10:00:00.000Z"
 *             endsAt: "2025-08-15T16:00:00.000Z"
 *             reason: "MAINTENANCE"
 *     responses:
 *       201:
 *         description: Court unavailability created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CourtUnavailability'
 *       400:
 *         description: Invalid data or conflicts with existing bookings
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied
 *       404:
 *         description: Court not found
 *       500:
 *         description: Internal server error
 */
router.post(
	"/:courtId/unavailability",
	requireAuth,
	CourtController.createCourtUnavailability
);

/**
 * @swagger
 * /api/courts/sports:
 *   get:
 *     summary: Get all sports
 *     description: Retrieve all available sports with court counts
 *     tags: [Courts]
 *     responses:
 *       200:
 *         description: Sports retrieved successfully
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
 *                     $ref: '#/components/schemas/Sport'
 *             example:
 *               message: "Sports retrieved successfully"
 *               data:
 *                 - id: "clxxxxx"
 *                   name: "Badminton"
 *                   icon: "badminton-icon"
 *                   _count:
 *                     courts: 25
 *                 - id: "clyyyyy"
 *                   name: "Tennis"
 *                   icon: "tennis-icon"
 *                   _count:
 *                     courts: 15
 *       500:
 *         description: Internal server error
 */
router.get("/sports", CourtController.getAllSports);

/**
 * @swagger
 * /api/courts/sports:
 *   post:
 *     summary: Create a new sport
 *     description: Create a new sport type (admin only)
 *     tags: [Courts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSportRequest'
 *           example:
 *             name: "Basketball"
 *             icon: "basketball-icon"
 *     responses:
 *       201:
 *         description: Sport created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Sport'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Admin privileges required
 *       409:
 *         description: Sport name already exists
 *       500:
 *         description: Internal server error
 */
router.post("/sports", requireAuth, CourtController.createSport);

export default router;

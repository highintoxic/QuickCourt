import { Router } from "express";
import { FacilityController } from "../controllers/FacilityController.js";
import {
	authenticate,
	requireFacilityOwner,
	requireUser,
} from "../middleware/rbac.js";
import { validateRequest, validateParams } from "../middleware/validation.js";
import { idParamSchema } from "../utils/validation.js";
import { z } from "zod";

const router = Router();
const facilityController = new FacilityController();

// Facility validation schemas
const createFacilitySchema = z.object({
	name: z.string().min(2, "Facility name must be at least 2 characters"),
	description: z.string().optional(),
	address: z.string().min(5, "Address must be at least 5 characters"),
	phone: z.string().optional(),
	email: z.string().email().optional(),
});

const updateFacilitySchema = z.object({
	name: z
		.string()
		.min(2, "Facility name must be at least 2 characters")
		.optional(),
	description: z.string().optional(),
	address: z
		.string()
		.min(5, "Address must be at least 5 characters")
		.optional(),
	phone: z.string().optional(),
	email: z.string().email().optional(),
	isActive: z.boolean().optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Facility:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Facility ID
 *         ownerId:
 *           type: string
 *           description: ID of the facility owner
 *         name:
 *           type: string
 *           description: Facility name
 *         description:
 *           type: string
 *           description: Facility description
 *         addressLine:
 *           type: string
 *           description: Street address
 *         city:
 *           type: string
 *           description: City
 *         state:
 *           type: string
 *           description: State or province
 *         pincode:
 *           type: string
 *           description: Postal/ZIP code
 *         phone:
 *           type: string
 *           description: Contact phone number
 *         email:
 *           type: string
 *           format: email
 *           description: Contact email address
 *         geoLat:
 *           type: number
 *           format: float
 *           description: Latitude coordinate
 *         geoLng:
 *           type: number
 *           format: float
 *           description: Longitude coordinate
 *         venueType:
 *           type: string
 *           enum: [INDOOR, OUTDOOR, MIXED]
 *           description: Type of venue
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *           description: Approval status
 *         rejectionReason:
 *           type: string
 *           description: Reason for rejection (if status is REJECTED)
 *         rating:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 5
 *           description: Average rating
 *         ratingCount:
 *           type: integer
 *           description: Number of ratings
 *         isActive:
 *           type: boolean
 *           description: Whether facility is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         owner:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             fullName:
 *               type: string
 *             email:
 *               type: string
 *         courts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               pricePerHour:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *               sport:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *         photos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               url:
 *                 type: string
 *               caption:
 *                 type: string
 *         amenities:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               amenityName:
 *                 type: string
 *         _count:
 *           type: object
 *           properties:
 *             courts:
 *               type: integer
 *             bookings:
 *               type: integer
 *             reviews:
 *               type: integer
 *
 *     CreateFacilityRequest:
 *       type: object
 *       required:
 *         - name
 *         - addressLine
 *         - city
 *         - state
 *         - pincode
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "Sports Complex Arena"
 *         description:
 *           type: string
 *           maxLength: 1000
 *           example: "Modern sports facility with multiple courts"
 *         addressLine:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *           example: "123 Main Street"
 *         city:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: "Mumbai"
 *         state:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: "Maharashtra"
 *         pincode:
 *           type: string
 *           pattern: '^\d{6}$'
 *           example: "400001"
 *         phone:
 *           type: string
 *           pattern: '^\+?[\d\s\-\(\)]{10,}$'
 *           example: "+91 9876543210"
 *         email:
 *           type: string
 *           format: email
 *           example: "contact@sportscomplex.com"
 *         geoLat:
 *           type: number
 *           format: float
 *           minimum: -90
 *           maximum: 90
 *           example: 19.0760
 *         geoLng:
 *           type: number
 *           format: float
 *           minimum: -180
 *           maximum: 180
 *           example: 72.8777
 *         venueType:
 *           type: string
 *           enum: [INDOOR, OUTDOOR, MIXED]
 *           default: INDOOR
 *           example: "INDOOR"
 *
 *     UpdateFacilityRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description:
 *           type: string
 *           maxLength: 1000
 *         addressLine:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *         city:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         state:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         pincode:
 *           type: string
 *           pattern: '^\d{6}$'
 *         phone:
 *           type: string
 *           pattern: '^\+?[\d\s\-\(\)]{10,}$'
 *         email:
 *           type: string
 *           format: email
 *         geoLat:
 *           type: number
 *           format: float
 *           minimum: -90
 *           maximum: 90
 *         geoLng:
 *           type: number
 *           format: float
 *           minimum: -180
 *           maximum: 180
 *         venueType:
 *           type: string
 *           enum: [INDOOR, OUTDOOR, MIXED]
 *         isActive:
 *           type: boolean
 */

/**
 * @swagger
 * /api/facilities:
 *   get:
 *     summary: Get all facilities
 *     description: Retrieve all approved and active facilities with optional filtering and pagination
 *     tags: [Facilities]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by facility name or location
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *       - in: query
 *         name: sportId
 *         schema:
 *           type: string
 *         description: Filter facilities that have courts for this sport
 *       - in: query
 *         name: venueType
 *         schema:
 *           type: string
 *           enum: [INDOOR, OUTDOOR, MIXED]
 *         description: Filter by venue type
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum rating filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, rating, createdAt, distance]
 *           default: name
 *         description: Sort criteria
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Facilities retrieved successfully
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
 *                     $ref: '#/components/schemas/Facility'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *                 filters:
 *                   type: object
 *                   properties:
 *                     cities:
 *                       type: array
 *                       items:
 *                         type: string
 *                     sports:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *       500:
 *         description: Internal server error
 */
router.get("/", facilityController.getAllFacilities.bind(facilityController));

/**
 * @swagger
 * /api/facilities/{facilityId}:
 *   get:
 *     summary: Get facility by ID
 *     description: Retrieve detailed information about a specific facility
 *     tags: [Facilities]
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *     responses:
 *       200:
 *         description: Facility retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Facility'
 *       404:
 *         description: Facility not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.get(
	"/:facilityId",
	validateParams(idParamSchema),
	facilityController.getFacilityById.bind(facilityController)
);

// Protected routes (authentication required)
router.use(authenticate);

/**
 * @swagger
 * /api/facilities:
 *   post:
 *     summary: Create a new facility
 *     description: Create a new facility (facility owners and admins only)
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFacilityRequest'
 *           example:
 *             name: "Sports Complex Arena"
 *             description: "Modern sports facility with multiple courts"
 *             addressLine: "123 Main Street"
 *             city: "Mumbai"
 *             state: "Maharashtra"
 *             pincode: "400001"
 *             phone: "+91 9876543210"
 *             email: "contact@sportscomplex.com"
 *             geoLat: 19.0760
 *             geoLng: 72.8777
 *             venueType: "INDOOR"
 *     responses:
 *       201:
 *         description: Facility created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Facility created successfully and submitted for approval"
 *                 data:
 *                   $ref: '#/components/schemas/Facility'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Validation error
 *                 value:
 *                   message: "Validation failed"
 *                   errors: ["Name is required", "Address must be at least 5 characters"]
 *               duplicateName:
 *                 summary: Duplicate facility name
 *                 value:
 *                   message: "A facility with this name already exists in this location"
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - facility owners and admins only
 *       500:
 *         description: Internal server error
 */
router.post(
	"/",
	requireFacilityOwner,
	validateRequest(createFacilitySchema),
	facilityController.createFacility.bind(facilityController)
);

/**
 * @swagger
 * /api/facilities/my/facilities:
 *   get:
 *     summary: Get user's facilities
 *     description: Retrieve all facilities owned by the authenticated user
 *     tags: [Facilities]
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
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Filter by approval status
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: User facilities retrieved successfully
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
 *                     $ref: '#/components/schemas/Facility'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     byStatus:
 *                       type: object
 *                       properties:
 *                         PENDING:
 *                           type: integer
 *                         APPROVED:
 *                           type: integer
 *                         REJECTED:
 *                           type: integer
 *                     totalRevenue:
 *                       type: number
 *                     totalBookings:
 *                       type: integer
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - facility owners and admins only
 *       500:
 *         description: Internal server error
 */
router.get(
	"/my/facilities",
	requireFacilityOwner,
	facilityController.getUserFacilities.bind(facilityController)
);

/**
 * @swagger
 * /api/facilities/{facilityId}:
 *   patch:
 *     summary: Update facility
 *     description: Update facility information (facility owners and admins only)
 *     tags: [Facilities]
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
 *             $ref: '#/components/schemas/UpdateFacilityRequest'
 *           examples:
 *             updateBasicInfo:
 *               summary: Update basic information
 *               value:
 *                 name: "Updated Sports Complex"
 *                 description: "Updated description with new features"
 *                 phone: "+91 9876543211"
 *             updateLocation:
 *               summary: Update location details
 *               value:
 *                 addressLine: "456 New Address"
 *                 city: "Delhi"
 *                 geoLat: 28.6139
 *                 geoLng: 77.2090
 *             toggleStatus:
 *               summary: Toggle active status
 *               value:
 *                 isActive: false
 *     responses:
 *       200:
 *         description: Facility updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Facility'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - can only update own facilities
 *       404:
 *         description: Facility not found
 *       500:
 *         description: Internal server error
 */
router.patch(
	"/:facilityId",
	requireFacilityOwner,
	validateParams(idParamSchema),
	validateRequest(updateFacilitySchema),
	facilityController.updateFacility.bind(facilityController)
);

/**
 * @swagger
 * /api/facilities/{facilityId}:
 *   delete:
 *     summary: Delete facility
 *     description: Delete a facility (facility owners and admins only). Cannot delete facilities with active bookings.
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *     responses:
 *       200:
 *         description: Facility deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Facility deleted successfully"
 *       400:
 *         description: Cannot delete facility with active bookings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               activeBookings:
 *                 summary: Has active bookings
 *                 value:
 *                   message: "Cannot delete facility with active bookings"
 *                   activeBookingsCount: 5
 *               hasCourts:
 *                 summary: Has associated courts
 *                 value:
 *                   message: "Please delete all courts before deleting the facility"
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - can only delete own facilities
 *       404:
 *         description: Facility not found
 *       500:
 *         description: Internal server error
 */
router.delete(
	"/:facilityId",
	requireFacilityOwner,
	validateParams(idParamSchema),
	facilityController.deleteFacility.bind(facilityController)
);

export default router;

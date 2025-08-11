import { Router } from "express";
import { AdminController } from "../controllers/AdminController.js";
import { authenticate, requireAdmin } from "../middleware/rbac.js";
import {
	validateRequest,
	validateParams,
	validateQuery,
} from "../middleware/validation.js";
import { paginationQuerySchema, idParamSchema } from "../utils/validation.js";

const router = Router();
const adminController = new AdminController();

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminUserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         fullName:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         role:
 *           type: string
 *           enum: [USER, FACILITY_OWNER, ADMIN, SUPER_ADMIN]
 *         isActive:
 *           type: boolean
 *         isVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *         _count:
 *           type: object
 *           properties:
 *             facilities:
 *               type: integer
 *             bookings:
 *               type: integer
 *             reviews:
 *               type: integer
 *
 *     UpdateUserRoleRequest:
 *       type: object
 *       required:
 *         - role
 *       properties:
 *         role:
 *           type: string
 *           enum: [USER, FACILITY_OWNER, ADMIN]
 *           example: "FACILITY_OWNER"
 *           description: New role to assign to the user
 *
 *     UpdateFacilityStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *           example: "APPROVED"
 *         rejectionReason:
 *           type: string
 *           description: Required when status is REJECTED
 *           example: "Incomplete documentation provided"
 *
 *     SystemStats:
 *       type: object
 *       properties:
 *         users:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             byRole:
 *               type: object
 *               properties:
 *                 USER:
 *                   type: integer
 *                 FACILITY_OWNER:
 *                   type: integer
 *                 ADMIN:
 *                   type: integer
 *             newThisMonth:
 *               type: integer
 *             activeUsers:
 *               type: integer
 *         facilities:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             byStatus:
 *               type: object
 *               properties:
 *                 PENDING:
 *                   type: integer
 *                 APPROVED:
 *                   type: integer
 *                 REJECTED:
 *                   type: integer
 *             newThisMonth:
 *               type: integer
 *         bookings:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             thisMonth:
 *               type: integer
 *             byStatus:
 *               type: object
 *               properties:
 *                 CONFIRMED:
 *                   type: integer
 *                 PENDING:
 *                   type: integer
 *                 COMPLETED:
 *                   type: integer
 *                 CANCELLED:
 *                   type: integer
 *             totalRevenue:
 *               type: number
 *             monthlyRevenue:
 *               type: number
 *         sports:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             mostPopular:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   bookingCount:
 *                     type: integer
 */

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Retrieve all users with filtering, searching, and pagination capabilities
 *     tags: [Admin - User Management]
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
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or phone
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, FACILITY_OWNER, ADMIN]
 *         description: Filter by user role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [fullName, email, createdAt, lastLoginAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                     $ref: '#/components/schemas/AdminUserResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     usersByRole:
 *                       type: object
 *                       properties:
 *                         USER:
 *                           type: integer
 *                         FACILITY_OWNER:
 *                           type: integer
 *                         ADMIN:
 *                           type: integer
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - admin role required
 *       500:
 *         description: Internal server error
 */
// User management routes
router.get(
	"/users",
	validateQuery(paginationQuerySchema),
	adminController.getAllUsers.bind(adminController)
);

/**
 * @swagger
 * /api/admin/users/{userId}/role:
 *   patch:
 *     summary: Update user role (Admin only)
 *     description: Change a user's role. Cannot change role of super admins or downgrade other admins.
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRoleRequest'
 *           examples:
 *             promoteToFacilityOwner:
 *               summary: Promote user to facility owner
 *               value:
 *                 role: "FACILITY_OWNER"
 *             promoteToAdmin:
 *               summary: Promote user to admin
 *               value:
 *                 role: "ADMIN"
 *             demoteToUser:
 *               summary: Demote to regular user
 *               value:
 *                 role: "USER"
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User role updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AdminUserResponse'
 *       400:
 *         description: Invalid role or operation not allowed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidRole:
 *                 summary: Invalid role provided
 *                 value:
 *                   message: "Invalid role specified"
 *               sameRole:
 *                 summary: User already has this role
 *                 value:
 *                   message: "User already has this role"
 *               cannotModifySuper:
 *                 summary: Cannot modify super admin
 *                 value:
 *                   message: "Cannot modify super admin roles"
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - admin role required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch(
	"/users/:userId/role",
	validateParams(idParamSchema),
	adminController.updateUserRole.bind(adminController)
);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   delete:
 *     summary: Delete user account (Admin only)
 *     description: Permanently delete a user account and all associated data. Cannot delete admin or super admin accounts.
 *     tags: [Admin - User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User account deleted successfully"
 *                 deletedData:
 *                   type: object
 *                   properties:
 *                     facilities:
 *                       type: integer
 *                     bookings:
 *                       type: integer
 *                     reviews:
 *                       type: integer
 *       400:
 *         description: Cannot delete admin accounts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               cannotDeleteAdmin:
 *                 summary: Cannot delete admin
 *                 value:
 *                   message: "Cannot delete admin or super admin accounts"
 *               hasActiveFacilities:
 *                 summary: User has active facilities
 *                 value:
 *                   message: "User has active facilities. Please transfer or deactivate them first"
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - admin role required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete(
	"/users/:userId",
	validateParams(idParamSchema),
	adminController.deleteUser.bind(adminController)
);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics (Admin only)
 *     description: Retrieve comprehensive system statistics including users, facilities, bookings, and revenue
 *     tags: [Admin - Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/SystemStats'
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - admin role required
 *       500:
 *         description: Internal server error
 */
// System stats
router.get("/stats", adminController.getSystemStats.bind(adminController));

/**
 * @swagger
 * /api/admin/facilities:
 *   get:
 *     summary: Get all facilities for review (Admin only)
 *     description: Retrieve all facilities with their approval status for admin review and management
 *     tags: [Admin - Facility Management]
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
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Filter by approval status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by facility name or location
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, status]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Facility'
 *                       - type: object
 *                         properties:
 *                           submittedAt:
 *                             type: string
 *                             format: date-time
 *                           reviewedAt:
 *                             type: string
 *                             format: date-time
 *                           reviewedBy:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalFacilities:
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
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - admin role required
 *       500:
 *         description: Internal server error
 */
// Facility management routes
router.get(
	"/facilities",
	validateQuery(paginationQuerySchema),
	adminController.getAllFacilitiesForReview.bind(adminController)
);

/**
 * @swagger
 * /api/admin/facilities/{facilityId}/status:
 *   patch:
 *     summary: Update facility approval status (Admin only)
 *     description: Approve, reject, or update the status of a facility
 *     tags: [Admin - Facility Management]
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
 *             $ref: '#/components/schemas/UpdateFacilityStatusRequest'
 *           examples:
 *             approve:
 *               summary: Approve facility
 *               value:
 *                 status: "APPROVED"
 *             reject:
 *               summary: Reject facility
 *               value:
 *                 status: "REJECTED"
 *                 rejectionReason: "Incomplete documentation provided"
 *             pending:
 *               summary: Set to pending review
 *               value:
 *                 status: "PENDING"
 *     responses:
 *       200:
 *         description: Facility status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Facility status updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Facility'
 *       400:
 *         description: Invalid status or missing rejection reason
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingRejectionReason:
 *                 summary: Missing rejection reason
 *                 value:
 *                   message: "Rejection reason is required when rejecting a facility"
 *               invalidStatus:
 *                 summary: Invalid status value
 *                 value:
 *                   message: "Invalid status value"
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Access denied - admin role required
 *       404:
 *         description: Facility not found
 *       500:
 *         description: Internal server error
 */
router.patch(
	"/facilities/:facilityId/status",
	validateParams(idParamSchema),
	adminController.updateFacilityStatus.bind(adminController)
);

export default router;

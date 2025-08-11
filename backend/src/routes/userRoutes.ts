import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { UserController } from "../controllers/UserController";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: User ID
 *         fullName:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         phone:
 *           type: string
 *           description: User's phone number
 *         role:
 *           type: string
 *           enum: [ADMIN, CUSTOMER, OWNER]
 *           description: User's role
 *         avatarUrl:
 *           type: string
 *           description: URL to user's avatar image
 *         isVerified:
 *           type: boolean
 *           description: Whether user's email is verified
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
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
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         phone:
 *           type: string
 *           pattern: '^[\+]?[0-9\s\-\(\)]{10,}$'
 *         avatarUrl:
 *           type: string
 *           format: uri
 *
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *         - confirmPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           minLength: 8
 *         newPassword:
 *           type: string
 *           minLength: 8
 *           pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$'
 *         confirmPassword:
 *           type: string
 *           minLength: 8
 *
 *     DeleteAccountRequest:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         password:
 *           type: string
 *           minLength: 8
 *
 *     UserStats:
 *       type: object
 *       properties:
 *         bookings:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             byStatus:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *         facilities:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             byStatus:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *         reviews:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             averageRating:
 *               type: number
 *               format: float
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information including counts of related resources
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/profile", requireAuth, UserController.getProfile);

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *           examples:
 *             updateName:
 *               summary: Update name only
 *               value:
 *                 fullName: "John Doe"
 *             updatePhone:
 *               summary: Update phone only
 *               value:
 *                 phone: "+1234567890"
 *             updateAll:
 *               summary: Update all fields
 *               value:
 *                 fullName: "John Doe"
 *                 phone: "+1234567890"
 *                 avatarUrl: "https://example.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Phone number already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/profile", requireAuth, UserController.updateProfile);

/**
 * @swagger
 * /api/user/change-password:
 *   post:
 *     summary: Change user password
 *     description: Change the authenticated user's password with validation
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *           example:
 *             currentPassword: "oldPassword123"
 *             newPassword: "NewPassword123"
 *             confirmPassword: "NewPassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Invalid password data or weak password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               incorrectCurrent:
 *                 summary: Incorrect current password
 *                 value:
 *                   message: "Current password is incorrect"
 *               passwordMismatch:
 *                 summary: New passwords don't match
 *                 value:
 *                   message: "New password and confirmation do not match"
 *               weakPassword:
 *                 summary: Password too weak
 *                 value:
 *                   message: "New password must contain at least one lowercase letter, one uppercase letter, and one number"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/change-password", requireAuth, UserController.changePassword);

/**
 * @swagger
 * /api/user/delete-account:
 *   delete:
 *     summary: Delete user account
 *     description: Permanently delete the authenticated user's account (soft delete)
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteAccountRequest'
 *           example:
 *             password: "userPassword123"
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account deleted successfully"
 *       400:
 *         description: Invalid password or active bookings exist
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     activeBookingsCount:
 *                       type: integer
 *             examples:
 *               incorrectPassword:
 *                 summary: Incorrect password
 *                 value:
 *                   message: "Incorrect password"
 *               activeBookings:
 *                 summary: Has active bookings
 *                 value:
 *                   message: "Cannot delete account with active bookings. Please cancel or complete all bookings first."
 *                   activeBookingsCount: 3
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/delete-account", requireAuth, UserController.deleteAccount);

/**
 * @swagger
 * /api/user/stats:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieve statistics about the authenticated user's bookings, facilities, and reviews
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/UserStats'
 *             example:
 *               message: "User statistics retrieved successfully"
 *               data:
 *                 bookings:
 *                   total: 25
 *                   byStatus:
 *                     CONFIRMED: 20
 *                     CANCELLED: 3
 *                     PENDING: 2
 *                 facilities:
 *                   total: 2
 *                   byStatus:
 *                     APPROVED: 2
 *                     PENDING: 0
 *                 reviews:
 *                   total: 15
 *                   averageRating: 4.2
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/stats", requireAuth, UserController.getUserStats);

export default router;

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users (Admin only)
 *     description: Get a paginated list of all users in the system
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN, FACILITY_OWNER]
 *         description: Filter users by role
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter users by verification status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by email or name
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, email, fullName]
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get user details (Admin only)
 *     description: Get detailed information about a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/User'
 *                         - type: object
 *                           properties:
 *                             _count:
 *                               type: object
 *                               properties:
 *                                 bookings:
 *                                   type: integer
 *                                 facilities:
 *                                   type: integer
 *                                 reviews:
 *                                   type: integer
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - admin role required
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
 *   delete:
 *     tags: [Admin]
 *     summary: Delete user (Admin only)
 *     description: Delete a user from the system
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - admin role required
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
 */

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Update user role (Admin only)
 *     description: Change a user's role in the system
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN, FACILITY_OWNER]
 *                 description: New role for the user
 *           example:
 *             role: "FACILITY_OWNER"
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error - invalid role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - admin role required
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
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get system statistics (Admin only)
 *     description: Get comprehensive system statistics including user counts, booking metrics, and revenue data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               description: Total number of users
 *                             verified:
 *                               type: integer
 *                               description: Number of verified users
 *                             byRole:
 *                               type: object
 *                               properties:
 *                                 USER:
 *                                   type: integer
 *                                 ADMIN:
 *                                   type: integer
 *                                 FACILITY_OWNER:
 *                                   type: integer
 *                         facilities:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               description: Total number of facilities
 *                             active:
 *                               type: integer
 *                               description: Number of active facilities
 *                             byStatus:
 *                               type: object
 *                               properties:
 *                                 ACTIVE:
 *                                   type: integer
 *                                 INACTIVE:
 *                                   type: integer
 *                                 SUSPENDED:
 *                                   type: integer
 *                         courts:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               description: Total number of courts
 *                             active:
 *                               type: integer
 *                               description: Number of active courts
 *                         bookings:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               description: Total number of bookings
 *                             byStatus:
 *                               type: object
 *                               properties:
 *                                 PENDING:
 *                                   type: integer
 *                                 CONFIRMED:
 *                                   type: integer
 *                                 CANCELLED:
 *                                   type: integer
 *                                 COMPLETED:
 *                                   type: integer
 *                             thisMonth:
 *                               type: integer
 *                               description: Bookings created this month
 *                         revenue:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: number
 *                               description: Total revenue from all bookings
 *                             thisMonth:
 *                               type: number
 *                               description: Revenue generated this month
 *                             lastMonth:
 *                               type: number
 *                               description: Revenue generated last month
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

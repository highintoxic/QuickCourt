/**
 * @swagger
 * /api/bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a new booking
 *     description: Book a court for a specific time period
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingRequest'
 *           example:
 *             courtId: "clm123456789"
 *             startTime: "2025-08-12T10:00:00Z"
 *             endTime: "2025-08-12T11:00:00Z"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Booking'
 *                         - type: object
 *                           properties:
 *                             court:
 *                               allOf:
 *                                 - $ref: '#/components/schemas/Court'
 *                                 - type: object
 *                                   properties:
 *                                     facility:
 *                                       $ref: '#/components/schemas/Facility'
 *                             user:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                                 fullName:
 *                                   type: string
 *       400:
 *         description: Validation error
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
 *       404:
 *         description: Court not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Court not available for selected time slot
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Get user's bookings
 *     description: Get a paginated list of current user's bookings
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *         description: Filter bookings by status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [startsAt, createdAt, totalAmount]
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
 *         description: User bookings retrieved successfully
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
 */

/**
 * @swagger
 * /api/bookings/availability:
 *   get:
 *     tags: [Bookings]
 *     summary: Check court availability
 *     description: Check availability of courts in a facility for a specific date and time
 *     parameters:
 *       - in: query
 *         name: facilityId
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID to check availability
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\\d{4}-\\d{2}-\\d{2}$'
 *         description: Date in YYYY-MM-DD format
 *         example: "2025-08-12"
 *       - in: query
 *         name: startTime
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\\d{2}:\\d{2}$'
 *         description: Start time in HH:MM format
 *         example: "10:00"
 *       - in: query
 *         name: endTime
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\\d{2}:\\d{2}$'
 *         description: End time in HH:MM format
 *         example: "11:00"
 *     responses:
 *       200:
 *         description: Availability check completed
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
 *                         availability:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               court:
 *                                 $ref: '#/components/schemas/Court'
 *                               available:
 *                                 type: boolean
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Facility not found or no active courts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking details
 *     description: Get detailed information about a specific booking
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
 *         description: Booking details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Booking'
 *                         - type: object
 *                           properties:
 *                             court:
 *                               allOf:
 *                                 - $ref: '#/components/schemas/Court'
 *                                 - type: object
 *                                   properties:
 *                                     facility:
 *                                       $ref: '#/components/schemas/Facility'
 *                             user:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                                 fullName:
 *                                   type: string
 *                             payment:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 amount:
 *                                   type: number
 *                                 status:
 *                                   type: string
 *                                   enum: [PENDING, SUCCESS, FAILED, REFUNDED]
 *                                 createdAt:
 *                                   type: string
 *                                   format: date-time
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - not authorized to view this booking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     tags: [Bookings]
 *     summary: Update booking status
 *     description: Update the status of a booking (facility owners and admins only)
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
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *                 description: New booking status
 *           example:
 *             status: "CONFIRMED"
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error
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
 *         description: Forbidden - not facility owner or admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   patch:
 *     tags: [Bookings]
 *     summary: Cancel booking
 *     description: Cancel a booking (only booking owner can cancel)
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
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Cannot cancel this booking (too close to start time or invalid status)
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
 *         description: Forbidden - not booking owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/bookings/facility/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get facility bookings
 *     description: Get all bookings for a facility (facility owners and admins only)
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *         description: Filter bookings by status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [startsAt, createdAt, totalAmount]
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
 *         description: Facility bookings retrieved successfully
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
 *         description: Forbidden - not facility owner or admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Facility not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

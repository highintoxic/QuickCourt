import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { validateRequest } from "../middleware/validation.js";
import {
	registerSchema,
	loginSchema,
	refreshTokenSchema,
	logoutSchema,
	logoutAllSchema,
	requestOTPSchema,
	verifyOTPSchema,
} from "../utils/validation.js";

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - password
 *         - role
 *       properties:
 *         fullName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           minLength: 8
 *           pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$'
 *           example: "Password123"
 *         phone:
 *           type: string
 *           pattern: '^\+?[\d\s\-\(\)]{10,}$'
 *           example: "+1234567890"
 *         role:
 *           type: string
 *           enum: [CUSTOMER, OWNER]
 *           example: "CUSTOMER"
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "Password123"
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             accessToken:
 *               type: string
 *               description: JWT access token
 *             refreshToken:
 *               type: string
 *               description: JWT refresh token
 *
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Valid refresh token
 *
 *     LogoutRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Refresh token to revoke
 *
 *     LogoutAllRequest:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID to logout from all devices
 *
 *     OTPRequest:
 *       type: object
 *       required:
 *         - email
 *         - type
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         type:
 *           type: string
 *           enum: [EMAIL_VERIFICATION, PASSWORD_RESET, LOGIN_VERIFICATION]
 *           example: "EMAIL_VERIFICATION"
 *
 *     OTPVerifyRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *         - type
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         otp:
 *           type: string
 *           minLength: 6
 *           maxLength: 6
 *           pattern: '^\d{6}$'
 *           example: "123456"
 *         type:
 *           type: string
 *           enum: [EMAIL_VERIFICATION, PASSWORD_RESET, LOGIN_VERIFICATION]
 *           example: "EMAIL_VERIFICATION"
 *         newPassword:
 *           type: string
 *           minLength: 8
 *           description: Required only for PASSWORD_RESET type
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             fullName: "John Doe"
 *             email: "john@example.com"
 *             password: "Password123"
 *             phone: "+1234567890"
 *             role: "CUSTOMER"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully. Please verify your email."
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
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
 *                   errors: ["Email is required", "Password must be at least 8 characters"]
 *               weakPassword:
 *                 summary: Weak password
 *                 value:
 *                   message: "Password must contain at least one lowercase letter, one uppercase letter, and one number"
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Email already registered"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
	"/register",
	validateRequest(registerSchema),
	authController.register.bind(authController)
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return access and refresh tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "john@example.com"
 *             password: "Password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               message: "Login successful"
 *               data:
 *                 user:
 *                   id: "clxxxxx"
 *                   email: "john@example.com"
 *                   fullName: "John Doe"
 *                   role: "CUSTOMER"
 *                   isVerified: true
 *                 accessToken: "eyJhbGciOiJIUzI1NiIs..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIs..."
 *       400:
 *         description: Invalid credentials or unverified email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidCredentials:
 *                 summary: Invalid credentials
 *                 value:
 *                   message: "Invalid email or password"
 *               unverifiedEmail:
 *                 summary: Email not verified
 *                 value:
 *                   message: "Please verify your email before logging in"
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post(
	"/login",
	validateRequest(loginSchema),
	authController.login.bind(authController)
);

/**
 * @swagger
 * /api/auth/token/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using a valid refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIs..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Invalid refresh token"
 *               expiredToken:
 *                 summary: Expired token
 *                 value:
 *                   message: "Refresh token has expired"
 *       500:
 *         description: Internal server error
 */
router.post(
	"/token/refresh",
	validateRequest(refreshTokenSchema),
	authController.refreshToken.bind(authController)
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Revoke a specific refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutRequest'
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIs..."
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 *       400:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post(
	"/logout",
	validateRequest(logoutSchema),
	authController.logout.bind(authController)
);

/**
 * @swagger
 * /api/auth/logout/all:
 *   post:
 *     summary: Logout from all devices
 *     description: Revoke all refresh tokens for a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutAllRequest'
 *           example:
 *             userId: "clxxxxx"
 *     responses:
 *       200:
 *         description: Logout from all devices successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out from all devices successfully"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post(
	"/logout/all",
	validateRequest(logoutAllSchema),
	authController.logoutAll.bind(authController)
);

/**
 * @swagger
 * /api/auth/otp/request:
 *   post:
 *     summary: Request OTP
 *     description: Send OTP to user's email for verification, password reset, or login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPRequest'
 *           examples:
 *             emailVerification:
 *               summary: Email verification
 *               value:
 *                 email: "john@example.com"
 *                 type: "EMAIL_VERIFICATION"
 *             passwordReset:
 *               summary: Password reset
 *               value:
 *                 email: "john@example.com"
 *                 type: "PASSWORD_RESET"
 *             loginVerification:
 *               summary: Login verification
 *               value:
 *                 email: "john@example.com"
 *                 type: "LOGIN_VERIFICATION"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP sent to your email address"
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     expiresIn:
 *                       type: integer
 *                       description: OTP expiry time in seconds
 *       400:
 *         description: Invalid request or rate limited
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               rateLimited:
 *                 summary: Rate limited
 *                 value:
 *                   message: "Please wait before requesting another OTP"
 *               alreadyVerified:
 *                 summary: Already verified
 *                 value:
 *                   message: "Email is already verified"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post(
	"/otp/request",
	validateRequest(requestOTPSchema),
	authController.requestOTP.bind(authController)
);

/**
 * @swagger
 * /api/auth/otp/verify:
 *   post:
 *     summary: Verify OTP
 *     description: Verify OTP for email verification, password reset, or login verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPVerifyRequest'
 *           examples:
 *             emailVerification:
 *               summary: Email verification
 *               value:
 *                 email: "john@example.com"
 *                 otp: "123456"
 *                 type: "EMAIL_VERIFICATION"
 *             passwordReset:
 *               summary: Password reset
 *               value:
 *                 email: "john@example.com"
 *                 otp: "123456"
 *                 type: "PASSWORD_RESET"
 *                 newPassword: "NewPassword123"
 *             loginVerification:
 *               summary: Login verification
 *               value:
 *                 email: "john@example.com"
 *                 otp: "123456"
 *                 type: "LOGIN_VERIFICATION"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                       description: Present for login verification
 *                     refreshToken:
 *                       type: string
 *                       description: Present for login verification
 *             examples:
 *               emailVerification:
 *                 summary: Email verification success
 *                 value:
 *                   message: "Email verified successfully"
 *                   data:
 *                     user:
 *                       id: "clxxxxx"
 *                       email: "john@example.com"
 *                       isVerified: true
 *               passwordReset:
 *                 summary: Password reset success
 *                 value:
 *                   message: "Password reset successfully"
 *                   data:
 *                     user:
 *                       id: "clxxxxx"
 *                       email: "john@example.com"
 *               loginVerification:
 *                 summary: Login verification success
 *                 value:
 *                   message: "Login verification successful"
 *                   data:
 *                     user:
 *                       id: "clxxxxx"
 *                       email: "john@example.com"
 *                       fullName: "John Doe"
 *                     accessToken: "eyJhbGciOiJIUzI1NiIs..."
 *                     refreshToken: "eyJhbGciOiJIUzI1NiIs..."
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidOTP:
 *                 summary: Invalid OTP
 *                 value:
 *                   message: "Invalid OTP"
 *               expiredOTP:
 *                 summary: Expired OTP
 *                 value:
 *                   message: "OTP has expired"
 *               missingPassword:
 *                 summary: Missing new password for reset
 *                 value:
 *                   message: "New password is required for password reset"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many verification attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post(
	"/otp/verify",
	validateRequest(verifyOTPSchema),
	authController.verifyOTP.bind(authController)
);

export default router;

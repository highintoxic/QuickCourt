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

// Auth routes with validation
router.post(
	"/register",
	validateRequest(registerSchema),
	authController.register.bind(authController)
);
router.post(
	"/login",
	validateRequest(loginSchema),
	authController.login.bind(authController)
);
router.post(
	"/token/refresh",
	validateRequest(refreshTokenSchema),
	authController.refreshToken.bind(authController)
);
router.post(
	"/logout",
	validateRequest(logoutSchema),
	authController.logout.bind(authController)
);
router.post(
	"/logout/all",
	validateRequest(logoutAllSchema),
	authController.logoutAll.bind(authController)
);

// OTP routes with validation
router.post(
	"/otp/request",
	validateRequest(requestOTPSchema),
	authController.requestOTP.bind(authController)
);
router.post(
	"/otp/verify",
	validateRequest(verifyOTPSchema),
	authController.verifyOTP.bind(authController)
);

export default router;

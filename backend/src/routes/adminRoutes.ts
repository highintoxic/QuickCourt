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

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// User management routes
router.get(
	"/users",
	validateQuery(paginationQuerySchema),
	adminController.getAllUsers.bind(adminController)
);

router.patch(
	"/users/:userId/role",
	validateParams(idParamSchema),
	adminController.updateUserRole.bind(adminController)
);

router.delete(
	"/users/:userId",
	validateParams(idParamSchema),
	adminController.deleteUser.bind(adminController)
);

// System stats
router.get("/stats", adminController.getSystemStats.bind(adminController));

export default router;

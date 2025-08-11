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

// Public routes (no authentication required)
router.get("/", facilityController.getAllFacilities.bind(facilityController));
router.get(
	"/:facilityId",
	validateParams(idParamSchema),
	facilityController.getFacilityById.bind(facilityController)
);

// Protected routes (authentication required)
router.use(authenticate);

// Create facility (Facility Owner or Admin)
router.post(
	"/",
	requireFacilityOwner,
	validateRequest(createFacilitySchema),
	facilityController.createFacility.bind(facilityController)
);

// Get user's facilities (Facility Owner or Admin)
router.get(
	"/my/facilities",
	requireFacilityOwner,
	facilityController.getUserFacilities.bind(facilityController)
);

// Update facility (Facility Owner or Admin - ownership checked in controller)
router.patch(
	"/:facilityId",
	requireFacilityOwner,
	validateParams(idParamSchema),
	validateRequest(updateFacilitySchema),
	facilityController.updateFacility.bind(facilityController)
);

// Delete facility (Facility Owner or Admin - ownership checked in controller)
router.delete(
	"/:facilityId",
	requireFacilityOwner,
	validateParams(idParamSchema),
	facilityController.deleteFacility.bind(facilityController)
);

export default router;

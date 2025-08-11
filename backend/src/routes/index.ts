import { Application } from "express";
import authRoutes from "./authRoutes.js";
import adminRoutes from "./adminRoutes.js";
import facilityRoutes from "./facilityRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import userRoutes from "./userRoutes.js";
import courtRoutes from "./courtRoutes.js";

// Simple route registration
export const registerRoutes = (app: Application) => {
	// Health check
	app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

	// API routes
	app.use("/api/auth", authRoutes);
	app.use("/api/admin", adminRoutes);
	app.use("/api/facilities", facilityRoutes);
	app.use("/api/bookings", bookingRoutes);
	app.use("/api/user", userRoutes);
	app.use("/api/courts", courtRoutes);

	console.log("✅ All routes registered successfully");
};

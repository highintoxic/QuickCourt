import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "QuickCourt API",
			version: "1.0.0",
			description: "Comprehensive Sports Facility Booking System API",
			contact: {
				name: "QuickCourt API Support",
				email: "support@quickcourt.com",
			},
		},
		servers: [
			{
				url: "http://localhost:4000",
				description: "Development server",
			},
			{
				url: "https://api.quickcourt.com",
				description: "Production server",
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
			schemas: {
				// User Models
				User: {
					type: "object",
					properties: {
						id: { type: "string", format: "cuid" },
						email: { type: "string", format: "email" },
						fullName: { type: "string", nullable: true },
						phone: { type: "string", nullable: true },
						avatarUrl: { type: "string", nullable: true },
						role: {
							type: "string",
							enum: ["USER", "ADMIN", "FACILITY_OWNER"],
							default: "USER",
						},
						isVerified: { type: "boolean", default: false },
						createdAt: { type: "string", format: "date-time" },
						updatedAt: { type: "string", format: "date-time" },
					},
				},

				// Facility Models
				Facility: {
					type: "object",
					properties: {
						id: { type: "string", format: "cuid" },
						name: { type: "string" },
						description: { type: "string", nullable: true },
						ownerId: { type: "string" },
						addressLine: { type: "string" },
						city: { type: "string" },
						state: { type: "string" },
						pincode: { type: "string" },
						phone: { type: "string", nullable: true },
						email: { type: "string", format: "email", nullable: true },
						website: { type: "string", nullable: true },
						status: {
							type: "string",
							enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
							default: "ACTIVE",
						},
						rating: { type: "number", format: "float", default: 0 },
						ratingCount: { type: "integer", default: 0 },
						createdAt: { type: "string", format: "date-time" },
						updatedAt: { type: "string", format: "date-time" },
					},
				},

				// Court Models
				Court: {
					type: "object",
					properties: {
						id: { type: "string", format: "cuid" },
						name: { type: "string" },
						facilityId: { type: "string" },
						description: { type: "string", nullable: true },
						venueType: {
							type: "string",
							enum: [
								"TENNIS",
								"BADMINTON",
								"SQUASH",
								"TABLE_TENNIS",
								"BASKETBALL",
								"VOLLEYBALL",
								"FOOTBALL",
								"OTHER",
							],
						},
						pricePerHour: { type: "number", format: "decimal" },
						isActive: { type: "boolean", default: true },
						createdAt: { type: "string", format: "date-time" },
						updatedAt: { type: "string", format: "date-time" },
					},
				},

				// Booking Models
				Booking: {
					type: "object",
					properties: {
						id: { type: "string", format: "cuid" },
						userId: { type: "string" },
						courtId: { type: "string" },
						startsAt: { type: "string", format: "date-time" },
						endsAt: { type: "string", format: "date-time" },
						hours: { type: "number", format: "float" },
						unitPrice: { type: "number", format: "decimal" },
						totalAmount: { type: "number", format: "decimal" },
						status: {
							type: "string",
							enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
							default: "PENDING",
						},
						paymentStatus: {
							type: "string",
							enum: ["UNPAID", "PAID", "FAILED", "REFUNDED"],
							default: "UNPAID",
						},
						createdAt: { type: "string", format: "date-time" },
						updatedAt: { type: "string", format: "date-time" },
					},
				},

				// Request/Response Models
				RegisterRequest: {
					type: "object",
					required: ["email", "password"],
					properties: {
						email: { type: "string", format: "email" },
						password: { type: "string", minLength: 8 },
						fullName: { type: "string" },
						phone: { type: "string" },
						role: {
							type: "string",
							enum: ["USER", "ADMIN", "FACILITY_OWNER"],
							default: "USER",
						},
					},
				},

				LoginRequest: {
					type: "object",
					required: ["email", "password"],
					properties: {
						email: { type: "string", format: "email" },
						password: { type: "string" },
					},
				},

				CreateFacilityRequest: {
					type: "object",
					required: ["name", "addressLine", "city", "state", "pincode"],
					properties: {
						name: { type: "string", minLength: 2 },
						description: { type: "string" },
						addressLine: { type: "string", minLength: 5 },
						city: { type: "string" },
						state: { type: "string" },
						pincode: { type: "string" },
						phone: { type: "string" },
						email: { type: "string", format: "email" },
						website: { type: "string" },
					},
				},

				CreateCourtRequest: {
					type: "object",
					required: ["name", "venueType", "pricePerHour"],
					properties: {
						name: { type: "string", minLength: 2 },
						description: { type: "string" },
						venueType: {
							type: "string",
							enum: [
								"TENNIS",
								"BADMINTON",
								"SQUASH",
								"TABLE_TENNIS",
								"BASKETBALL",
								"VOLLEYBALL",
								"FOOTBALL",
								"OTHER",
							],
						},
						pricePerHour: { type: "number", minimum: 0 },
						isActive: { type: "boolean", default: true },
					},
				},

				CreateBookingRequest: {
					type: "object",
					required: ["courtId", "startTime", "endTime"],
					properties: {
						courtId: { type: "string", format: "cuid" },
						startTime: { type: "string", format: "date-time" },
						endTime: { type: "string", format: "date-time" },
					},
				},

				// Response Models
				ApiResponse: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
						data: { type: "object" },
					},
				},

				PaginatedResponse: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
						data: { type: "array", items: { type: "object" } },
						pagination: {
							type: "object",
							properties: {
								page: { type: "integer" },
								limit: { type: "integer" },
								total: { type: "integer" },
								totalPages: { type: "integer" },
							},
						},
					},
				},

				ErrorResponse: {
					type: "object",
					properties: {
						success: { type: "boolean", default: false },
						message: { type: "string" },
						errors: {
							type: "array",
							items: {
								type: "object",
								properties: {
									field: { type: "string" },
									message: { type: "string" },
								},
							},
						},
					},
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
	},
	apis: ["./src/routes/*.ts", "./src/controllers/*.ts", "./src/swagger/*.ts"],
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
	app.use(
		"/api-docs",
		swaggerUi.serve,
		swaggerUi.setup(specs, {
			explorer: true,
			customCss: ".swagger-ui .topbar { display: none }",
			customSiteTitle: "QuickCourt API Documentation",
		})
	);

	// JSON endpoint for the swagger spec
	app.get("/api-docs.json", (req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.send(specs);
	});
};

export default specs;

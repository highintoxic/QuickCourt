import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction
) {
	console.error("Error:", err);

	// Don't send response if headers already sent
	if (res.headersSent) return;

	// Handle Zod validation errors
	if (err instanceof ZodError) {
		const errorMessages = err.errors.map((error) => ({
			field: error.path.join("."),
			message: error.message,
		}));

		return res.status(400).json({
			success: false,
			message: "Validation failed",
			errors: errorMessages,
		});
	}

	// Handle Prisma errors
	if (err.code === "P2002") {
		return res.status(409).json({
			success: false,
			message: "Resource already exists",
		});
	}

	if (err.code === "P2025") {
		return res.status(404).json({
			success: false,
			message: "Resource not found",
		});
	}

	// Handle JWT errors
	if (err.name === "JsonWebTokenError") {
		return res.status(401).json({
			success: false,
			message: "Invalid token",
		});
	}

	if (err.name === "TokenExpiredError") {
		return res.status(401).json({
			success: false,
			message: "Token expired",
		});
	}

	// Default error response
	const statusCode = err.status || err.statusCode || 500;
	const message = err.message || "Internal Server Error";

	res.status(statusCode).json({
		success: false,
		message,
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
}

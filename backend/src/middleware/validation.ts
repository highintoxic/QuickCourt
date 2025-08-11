import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

// Validation middleware factory
export const validateRequest = (schema: z.ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			// Validate request body
			const validatedData = schema.parse(req.body);
			req.body = validatedData; // Replace with validated data
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const errorMessages = error.errors.map((err) => ({
					field: err.path.join("."),
					message: err.message,
				}));

				return res.status(400).json({
					success: false,
					message: "Validation failed",
					errors: errorMessages,
				});
			}

			// Pass other errors to error handler
			next(error);
		}
	};
};

// Validate query parameters
export const validateQuery = (schema: z.ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedData = schema.parse(req.query);
			req.query = validatedData;
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const errorMessages = error.errors.map((err) => ({
					field: err.path.join("."),
					message: err.message,
				}));

				return res.status(400).json({
					success: false,
					message: "Query validation failed",
					errors: errorMessages,
				});
			}

			next(error);
		}
	};
};

// Validate URL parameters
export const validateParams = (schema: z.ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedData = schema.parse(req.params);
			req.params = validatedData;
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const errorMessages = error.errors.map((err) => ({
					field: err.path.join("."),
					message: err.message,
				}));

				return res.status(400).json({
					success: false,
					message: "Parameter validation failed",
					errors: errorMessages,
				});
			}

			next(error);
		}
	};
};

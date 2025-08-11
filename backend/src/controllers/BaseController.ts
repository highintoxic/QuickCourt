import { Request, Response, NextFunction } from "express";

export class BaseController {
	// Helper method to handle async operations
	protected asyncHandler = (fn: Function) => {
		return (req: Request, res: Response, next: NextFunction) => {
			Promise.resolve(fn(req, res, next)).catch(next);
		};
	};

	// Helper method for success responses
	protected success(
		res: Response,
		data: any,
		message = "Success",
		statusCode = 200
	) {
		return res.status(statusCode).json({
			success: true,
			message,
			data,
		});
	}

	// Helper method for paginated success responses
	protected successWithPagination(
		res: Response,
		data: any,
		pagination: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		},
		message = "Success",
		statusCode = 200
	) {
		return res.status(statusCode).json({
			success: true,
			message,
			data,
			pagination,
		});
	}

	// Helper method for error responses
	protected error(
		res: Response,
		message = "Internal Server Error",
		statusCode = 500,
		errors?: any[]
	) {
		const response: any = {
			success: false,
			message,
		};

		if (errors && errors.length > 0) {
			response.errors = errors;
		}

		return res.status(statusCode).json(response);
	}

	// Helper method for validation errors
	protected validationError(res: Response, errors: any[]) {
		return this.error(res, "Validation failed", 400, errors);
	}

	// Helper method for not found errors
	protected notFound(res: Response, resource = "Resource") {
		return this.error(res, `${resource} not found`, 404);
	}

	// Helper method for unauthorized errors
	protected unauthorized(res: Response, message = "Unauthorized") {
		return this.error(res, message, 401);
	}

	// Helper method for forbidden errors
	protected forbidden(res: Response, message = "Forbidden") {
		return this.error(res, message, 403);
	}
}

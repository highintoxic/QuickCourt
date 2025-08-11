import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController.js";

export class ExampleController extends BaseController {
	// GET /api/example
	async getAll(req: Request, res: Response, next: NextFunction) {
		try {
			// Your logic here
			const data = { message: "Hello from ExampleController!" };
			this.success(res, data);
		} catch (error) {
			next(error);
		}
	}

	// POST /api/example
	async create(req: Request, res: Response, next: NextFunction) {
		try {
			const { name } = req.body;

			if (!name) {
				return this.error(res, "Name is required", 400);
			}

			// Your create logic here
			const data = { id: 1, name };
			this.success(res, data, "Created successfully", 201);
		} catch (error) {
			next(error);
		}
	}

	// GET /api/example/:id
	async getById(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;

			// Your logic here
			const data = { id, name: `Example ${id}` };
			this.success(res, data);
		} catch (error) {
			next(error);
		}
	}

	// PUT /api/example/:id
	async update(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const { name } = req.body;

			// Your update logic here
			const data = { id, name };
			this.success(res, data, "Updated successfully");
		} catch (error) {
			next(error);
		}
	}

	// DELETE /api/example/:id
	async delete(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;

			// Your delete logic here
			this.success(res, null, "Deleted successfully");
		} catch (error) {
			next(error);
		}
	}
}

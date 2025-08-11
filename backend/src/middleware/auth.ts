import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthRequest extends Request {
	userId?: string;
}

export function requireAuth(
	req: AuthRequest,
	res: Response,
	next: NextFunction
) {
	const header = req.headers.authorization;
	if (!header)
		return res.status(401).json({ message: "Missing Authorization header" });
	const token = header.replace("Bearer ", "");
	try {
		const payload = jwt.verify(token, env.jwt.secret) as any;
		req.userId = payload.sub;
		next();
	} catch {
		return res.status(401).json({ message: "Invalid token" });
	}
}

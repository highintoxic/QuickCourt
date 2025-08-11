import morgan from "morgan";
import { env } from "../config/env.js";
import { RequestHandler } from "express";

export const loggerMiddleware: RequestHandler = morgan(
	env.nodeEnv === "production" ? "combined" : "dev"
);

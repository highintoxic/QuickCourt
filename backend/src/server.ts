import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { loggerMiddleware } from "./utils/logger.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use(errorHandler);

app.listen(env.port, () => {
	console.log(`Server listening on port ${env.port}`);
});

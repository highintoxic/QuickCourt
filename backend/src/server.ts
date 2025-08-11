import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { loggerMiddleware } from "./utils/logger.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { setupSwagger } from "./config/swagger.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Setup Swagger documentation
setupSwagger(app);

// Register all routes
registerRoutes(app);

app.use(errorHandler);

app.listen(env.port, () => {
	console.log(`🚀 Server listening on port ${env.port}`);
	console.log(`📚 API Documentation: http://localhost:${env.port}/api-docs`);
});

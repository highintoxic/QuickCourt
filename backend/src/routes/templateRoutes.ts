import { Router } from "express";
import { ExampleController } from "../controllers/ExampleController.js";

const router = Router();
const controller = new ExampleController();

// Define routes using controller methods
router.get("/", controller.getAll.bind(controller));
router.post("/", controller.create.bind(controller));
router.get("/:id", controller.getById.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;

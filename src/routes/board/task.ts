import express from "express";
import { authenticate } from "../../middlewares/authenticate";
import { createTask } from "../../controllers/taskController";

const router = express.Router();

router.post("/create", authenticate, createTask);

export default router;

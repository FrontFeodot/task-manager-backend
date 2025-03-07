import express from "express";
import { authenticate } from "../../middlewares/authenticate";
import { createTask, updateTask } from "../../controllers/taskController";

const router = express.Router();

router.post("/create", authenticate, createTask);
router.put("/update", authenticate, updateTask);

export default router;

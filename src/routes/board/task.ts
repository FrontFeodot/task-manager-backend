import express from "express";
import { authenticate } from "../../middlewares/authenticate";
import { createTask, deleteTask, updateTask } from "../../controllers/taskController";

const router = express.Router();

router.post("/create", authenticate, createTask);
router.put("/update", authenticate, updateTask);
router.put("/delete", authenticate, deleteTask);

export default router;

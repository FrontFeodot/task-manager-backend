import express from "express";
import { getBoardList, updateColumnOrder, updateTaskOrder } from "../../controllers/boardController";
import { authenticate } from "../../middlewares/authenticate";
import { createBoard } from "../../controllers/boardController";

const router = express.Router();

router.get("/all", authenticate, getBoardList);
router.post("/create", authenticate, createBoard);
router.put("/update/tasks", authenticate, updateTaskOrder);
router.put("/update/columns", authenticate, updateColumnOrder);

export default router;

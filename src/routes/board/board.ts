import express from "express";
import {
  deleteBoard,
  getBoardList,
  updateBoardTitle,
  updateColumnOrder,
  updateTaskOrder,
} from "../../controllers/boardController";
import { authenticate } from "../../middlewares/authenticate";
import { createBoard } from "../../controllers/boardController";

const router = express.Router();

router.get("/all", authenticate, getBoardList);
router.post("/create", authenticate, createBoard);
router.delete("/delete", authenticate, deleteBoard);
router.put("/update/title", authenticate, updateBoardTitle);
router.put("/update/tasks", authenticate, updateTaskOrder);
router.put("/update/columns", authenticate, updateColumnOrder);

export default router;

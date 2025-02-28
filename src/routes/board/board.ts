import express from "express";
import { getBoard } from "../../controllers/boardController";
import { authenticate } from "../../middlewares/authenticate";
import { createBoard } from "../../controllers/boardController";

const router = express.Router();

router.get("/all", authenticate, getBoard);
router.post("/create", authenticate, createBoard);

export default router;

import express from "express";
import { getBoard } from "../../controllers/boardController";
import { authenticate } from "../../middlewares/authenticate";

const router = express.Router();

router.get("/all", authenticate, getBoard);

export default router;

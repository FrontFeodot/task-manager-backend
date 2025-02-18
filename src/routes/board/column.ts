import express from "express";
import { authenticate } from "../../middlewares/authenticate";
import { createColumn } from "../../controllers/columnController";

const router = express.Router();

router.post("/create", authenticate, createColumn);

export default router;

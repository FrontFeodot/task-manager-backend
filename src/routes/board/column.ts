import express from "express";
import { authenticate } from "../../middlewares/authenticate";
import { createColumn, deleteColumn, updateColumn } from "../../controllers/columnController";

const router = express.Router();

router.post("/create", authenticate, createColumn);
router.put("/update", authenticate, updateColumn);
router.delete("/delete", authenticate, deleteColumn);


export default router;

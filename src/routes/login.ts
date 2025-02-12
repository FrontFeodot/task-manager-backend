import express from "express";
import { getProtected, postLogin } from "../controllers/loginController";
import { postRegister } from "../controllers/registerController";

const router = express.Router();

router.post("/login", postLogin);
router.post("/signup", postRegister);
router.post("/protected", getProtected);

export default router;

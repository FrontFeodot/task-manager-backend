"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const loginController_1 = require("../controllers/loginController");
const registerController_1 = require("../controllers/registerController");
const router = express_1.default.Router();
router.post("/login", loginController_1.postLogin);
router.post("/signup", registerController_1.postRegister);
router.post("/protected", loginController_1.getProtected);
exports.default = router;

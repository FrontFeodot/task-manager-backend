"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticate_1 = require("../../middlewares/authenticate");
const taskController_1 = require("../../controllers/taskController");
const router = express_1.default.Router();
router.post("/create", authenticate_1.authenticate, taskController_1.createTask);
router.put("/update", authenticate_1.authenticate, taskController_1.updateTask);
router.put("/delete", authenticate_1.authenticate, taskController_1.deleteTask);
exports.default = router;

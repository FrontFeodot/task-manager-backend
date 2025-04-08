"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticate_1 = require("../../middlewares/authenticate");
const columnController_1 = require("../../controllers/columnController");
const router = express_1.default.Router();
router.post("/create", authenticate_1.authenticate, columnController_1.createColumn);
router.put("/update", authenticate_1.authenticate, columnController_1.updateColumn);
router.delete("/delete", authenticate_1.authenticate, columnController_1.deleteColumn);
exports.default = router;

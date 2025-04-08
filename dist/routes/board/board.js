"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const boardController_1 = require("../../controllers/boardController");
const authenticate_1 = require("../../middlewares/authenticate");
const boardController_2 = require("../../controllers/boardController");
const router = express_1.default.Router();
router.get("/all", authenticate_1.authenticate, boardController_1.getBoardList);
router.post("/create", authenticate_1.authenticate, boardController_2.createBoard);
router.delete("/delete", authenticate_1.authenticate, boardController_1.deleteBoard);
router.put("/update/title", authenticate_1.authenticate, boardController_1.updateBoardTitle);
router.put("/update/tasks", authenticate_1.authenticate, boardController_1.updateTaskOrder);
router.put("/update/columns", authenticate_1.authenticate, boardController_1.updateColumnOrder);
exports.default = router;

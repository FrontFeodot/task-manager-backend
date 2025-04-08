"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskForBoard = exports.getBoardHelper = void 0;
const board_1 = require("../../models/board/board");
const error_1 = __importDefault(require("./error"));
const lodash_1 = require("lodash");
const getBoardHelper = (userId, boardId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield board_1.Board.findOne({ boardId, userId }).exec();
        if (!response) {
            throw response;
        }
        return response;
    }
    catch (err) {
        return new error_1.default({
            isError: 1,
            message: "Get board error",
            payload: err,
        });
    }
});
exports.getBoardHelper = getBoardHelper;
const getTaskForBoard = (tasks, boardId) => {
    return (0, lodash_1.reduce)(tasks, (acc, task) => {
        if (task.boardId === boardId) {
            const filteredTask = (0, lodash_1.omit)(task, ["userId", "_id", "__v"]);
            acc.push(filteredTask);
        }
        return acc;
    }, []);
};
exports.getTaskForBoard = getTaskForBoard;

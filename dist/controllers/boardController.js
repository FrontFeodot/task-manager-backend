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
exports.updateColumnOrder = exports.updateTaskOrder = exports.getBoardList = exports.deleteBoard = exports.updateBoardTitle = exports.createBoard = exports.initDefaultBoard = void 0;
const board_1 = require("../models/board/board");
const task_1 = require("../models/board/task");
const error_1 = __importDefault(require("../common/utils/error"));
const lodash_1 = require("lodash");
const nanoid_1 = require("nanoid");
const boardHelper_1 = require("../common/utils/boardHelper");
const initDefaultBoard = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const boardId = (0, nanoid_1.nanoid)();
    const initColumnTitles = ["day", "week", "month", "quarter", "year"];
    const columns = (0, lodash_1.map)(initColumnTitles, (columnTitle, index) => {
        return {
            title: columnTitle,
            order: index + 1,
            columnId: (0, nanoid_1.nanoid)(),
        };
    });
    const defaultBoard = new board_1.Board({
        title: "Weekly planer",
        boardId,
        columns,
        userId,
    });
    try {
        yield defaultBoard.save();
    }
    catch (err) {
        console.error(err);
    }
});
exports.initDefaultBoard = initDefaultBoard;
const createBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, userId } = req.body;
        if (!title) {
            throw new error_1.default({ isError: 1, message: "Missing title" });
        }
        const boardId = (0, nanoid_1.nanoid)();
        const board = new board_1.Board({ title, boardId, userId, columns: [] });
        yield board.save();
        res.status(200).send(new error_1.default({
            isSuccess: 1,
            message: "Board created successfully",
        }));
    }
    catch (err) {
        console.error(err);
        if (err instanceof error_1.default) {
            res.status(500).send(err);
            return;
        }
        res.status(500).json(new error_1.default({
            isError: 1,
            message: "An error occurred while creating a board",
        }));
    }
});
exports.createBoard = createBoard;
const updateBoardTitle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, userId, boardId } = req.body;
        if (!title || !boardId) {
            throw new error_1.default({ isError: 1, message: "Missing data" });
        }
        const updatedBoard = yield board_1.Board.findOneAndUpdate({ userId, boardId }, { title });
        if (!updatedBoard) {
            throw new error_1.default({
                isError: 1,
                message: "An error while updating the board",
            });
        }
        res.status(200).send(new error_1.default({
            isSuccess: 1,
            message: "Board updated successfully",
        }));
    }
    catch (err) {
        console.error(err);
        if (err instanceof error_1.default) {
            res.status(500).send(err);
            return;
        }
        res.status(500).json(new error_1.default({
            isError: 1,
            message: "An error occurred while updating a board",
        }));
    }
});
exports.updateBoardTitle = updateBoardTitle;
const deleteBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, boardId } = req.body;
        if (!boardId) {
            throw new error_1.default({ isError: 1, message: "Missing board id" });
        }
        const deletedBoard = yield board_1.Board.findOneAndDelete({ userId, boardId });
        const deletedTasks = yield task_1.Task.deleteMany({ userId, boardId });
        if (!deletedBoard || !deletedTasks) {
            throw new error_1.default({
                isError: 1,
                message: "An error while updating the board",
            });
        }
        res.status(200).send(new error_1.default({
            isSuccess: 1,
            message: "Board deleted successfully",
        }));
    }
    catch (err) {
        console.error(err);
        if (err instanceof error_1.default) {
            res.status(500).send(err);
            return;
        }
        res.status(500).json(new error_1.default({
            isError: 1,
            message: "An error occurred while deleting a board",
        }));
    }
});
exports.deleteBoard = deleteBoard;
const getBoardList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        if (!userId) {
            res
                .status(401)
                .send(new error_1.default({ isError: 1, message: "userId is missing" }));
        }
        const boards = yield board_1.Board.find({ userId }).lean();
        const boardsIds = boards.map((board) => board.boardId);
        const tasks = yield task_1.Task.find({
            boardId: boardsIds,
            userId: userId,
        }).lean();
        const board = (0, lodash_1.reduce)(boards, (result, boardItem) => {
            return (0, lodash_1.assign)(result, {
                [boardItem.title]: Object.assign(Object.assign({}, (0, lodash_1.omit)(boardItem, ["userId", "_id", "__v"])), { tasks: (0, boardHelper_1.getTaskForBoard)(tasks, boardItem.boardId) }),
            });
        }, {});
        res.status(200).send(new error_1.default({
            isSuccess: 1,
            message: "Success",
            payload: board,
        }));
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .send(new error_1.default({ isError: 1, message: "Error fetching board" }));
    }
});
exports.getBoardList = getBoardList;
const updateTaskOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tasksToUpdate = req.body.tasksToUpdate;
    if (!tasksToUpdate) {
        res
            .status(500)
            .send(new error_1.default({ isError: 1, message: "missing data" }));
    }
    const updates = tasksToUpdate.map((item) => ({
        updateOne: {
            filter: { taskId: item.taskId, boardId: item.boardId },
            update: { $set: { order: item.order, columnId: item.columnId } },
        },
    }));
    try {
        const response = yield task_1.Task.bulkWrite(updates);
        if (!response || response instanceof Error) {
            throw new error_1.default({ isError: 1, message: "Saving error" });
        }
        yield (0, exports.getBoardList)(req, res);
    }
    catch (err) {
        console.error("updateTaskOrder", err);
    }
});
exports.updateTaskOrder = updateTaskOrder;
const updateColumnOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { columns, boardId } = req.body;
    if (!columns || !boardId) {
        res
            .status(500)
            .send(new error_1.default({ isError: 1, message: "missing data" }));
    }
    try {
        const response = yield board_1.Board.findOneAndUpdate({ boardId: boardId }, {
            columns,
        });
        if (!response) {
            throw response;
        }
        yield (0, exports.getBoardList)(req, res);
    }
    catch (err) {
        console.error("Columns update error", err);
        res
            .status(500)
            .send(new error_1.default({ isError: 1, message: "Columns update error" }));
    }
});
exports.updateColumnOrder = updateColumnOrder;

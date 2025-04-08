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
exports.deleteColumn = exports.updateColumn = exports.createColumn = void 0;
const error_1 = __importDefault(require("../common/utils/error"));
const lodash_1 = require("lodash");
const nanoid_1 = require("nanoid");
const boardHelper_1 = require("../common/utils/boardHelper");
const task_1 = require("../models/board/task");
const createColumn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, boardId, order, userId } = req.body;
    if (!title || !boardId) {
        res
            .status(500)
            .send(new error_1.default({ isError: 1, message: "Missing title" }));
    }
    try {
        const boardResponse = yield (0, boardHelper_1.getBoardHelper)(userId, boardId);
        if (boardResponse instanceof error_1.default) {
            throw boardResponse;
        }
        const { columns } = boardResponse;
        const isAlreadyExist = (0, lodash_1.some)(columns, (column) => column.title === title);
        if (isAlreadyExist) {
            res.status(409).send(new error_1.default({
                isError: 1,
                message: "Column already exist, please choose another name",
            }));
            return;
        }
        const newColumn = { title, order, columnId: (0, nanoid_1.nanoid)() };
        boardResponse.set("columns", [...columns, newColumn]);
        boardResponse.save();
        res.status(200).send(new error_1.default({
            isSuccess: 1,
            message: "Column created successfully",
        }));
    }
    catch (err) {
        console.error(err);
        if (err instanceof error_1.default) {
            res.status(500).send(err);
            return;
        }
        res.status(500).send(new error_1.default({
            isError: 1,
            message: "Something went wrong while creating column",
            payload: err,
        }));
    }
});
exports.createColumn = createColumn;
const updateColumn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, boardId, columnId, title } = req.body;
    try {
        const board = yield (0, boardHelper_1.getBoardHelper)(userId, boardId);
        if (board instanceof error_1.default) {
            throw board;
        }
        const updatedColumns = (0, lodash_1.map)(board.columns, (column) => {
            if (column.columnId === columnId) {
                return Object.assign(Object.assign({}, column), { title });
            }
            return column;
        });
        board.columns = updatedColumns;
        board.save();
        res.status(200).send(new error_1.default({
            isSuccess: 1,
            message: "Column updated successfuly",
        }));
    }
    catch (err) {
        console.error("Column update error", err);
        if (err instanceof error_1.default) {
            res.status(500).send(err);
            return;
        }
        res
            .status(500)
            .send(new error_1.default({ isError: 1, message: "Column update error" }));
    }
});
exports.updateColumn = updateColumn;
const deleteColumn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, boardId, columnId, tasksPath } = req.body;
    if (!req.body) {
        res
            .status(500)
            .send(new error_1.default({ isError: 1, message: "Missing data" }));
    }
    try {
        const board = yield (0, boardHelper_1.getBoardHelper)(userId, boardId);
        if (board instanceof error_1.default) {
            throw board;
        }
        const removedColumn = (0, lodash_1.findIndex)(board.columns, (column) => column.columnId === columnId);
        board.columns.splice(removedColumn, 1);
        const sortedColumns = (0, lodash_1.sortBy)(board.columns, ["order"]);
        const updatedColumns = (0, lodash_1.map)(sortedColumns, (column, index) => (Object.assign(Object.assign({}, column), { order: index + 1 })));
        board.columns = updatedColumns;
        if (tasksPath === "delete") {
            yield task_1.Task.deleteMany({ userId, columnId, boardId });
        }
        else {
            const lastTaskOrderInColumn = yield task_1.Task.findOne({
                userId,
                boardId,
                columnId: tasksPath,
            })
                .sort({ order: -1 })
                .exec();
            const tasksToUpdate = yield task_1.Task.find({ userId, columnId, boardId });
            const updates = (0, lodash_1.map)(tasksToUpdate, (item, index) => {
                let order = index + 1;
                if (lastTaskOrderInColumn === null || lastTaskOrderInColumn === void 0 ? void 0 : lastTaskOrderInColumn.order) {
                    order = lastTaskOrderInColumn.order + index + 1;
                }
                return {
                    updateOne: {
                        filter: { taskId: item.taskId, boardId: item.boardId },
                        update: { $set: { order, columnId: tasksPath } },
                    },
                };
            });
            const response = yield task_1.Task.bulkWrite(updates);
            if (!response) {
                throw new error_1.default({ isError: 1, message: "Task update error" });
            }
        }
        yield board.save();
        res.status(200).send(new error_1.default({
            isSuccess: 1,
            message: "Column deleted successfully",
        }));
    }
    catch (err) {
        if (err instanceof error_1.default) {
            res.status(500).send(err);
            return;
        }
        res.status(500).send(new error_1.default({
            isError: 1,
            message: "Something went wrong while deleting column",
            payload: err,
        }));
    }
});
exports.deleteColumn = deleteColumn;

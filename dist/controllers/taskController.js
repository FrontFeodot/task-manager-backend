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
exports.deleteTask = exports.getTasksForColumn = exports.updateTask = exports.createTask = void 0;
const task_1 = require("../models/board/task");
const error_1 = __importDefault(require("../common/utils/error"));
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lastTask = yield task_1.Task.findOne({ userId: req.body.userId })
            .sort({ taskId: -1 })
            .select("taskId")
            .exec();
        const newTaskId = lastTask ? lastTask.taskId + 1 : 1;
        const task = new task_1.Task(Object.assign(Object.assign({}, req.body), { taskId: newTaskId }));
        yield task.save();
        res
            .status(200)
            .send(new error_1.default({ isSuccess: 1, message: "Created successfuly" }));
    }
    catch (err) {
        console.error("createTask error", err);
        res.status(500).send(new error_1.default({
            isError: 1,
            message: "An error occurred while creating a task",
            payload: err,
        }));
    }
});
exports.createTask = createTask;
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, boardId, taskId } = req.body;
    try {
        const response = yield task_1.Task.findOneAndUpdate({ userId, taskId, boardId }, Object.assign(Object.assign({}, req.body), { updatedAt: Date.now() }));
        if (response instanceof Error) {
            throw response;
        }
        res.status(200).send(new error_1.default({
            isSuccess: 1,
            message: "Task updated successfuly",
        }));
    }
    catch (err) {
        console.error("Task update error", err);
        res
            .status(500)
            .send(new error_1.default({ isError: 1, message: "Task update error" }));
    }
});
exports.updateTask = updateTask;
const getTasksForColumn = (columnId) => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = yield task_1.Task.find({ columnId: columnId })
        .populate("column")
        .exec();
    return tasks;
});
exports.getTasksForColumn = getTasksForColumn;
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, boardId, taskId } = req.body;
    try {
        const response = yield task_1.Task.findOneAndDelete({ userId, taskId, boardId });
        if (!response || response instanceof Error) {
            throw response;
        }
        res
            .status(200)
            .send(new error_1.default({ isSuccess: 1, message: "Task delete successful" }));
    }
    catch (err) {
        console.error("Task delete error: ", err);
        res.status(500).send(new error_1.default({
            isError: 1,
            message: "Task delete err",
            payload: err,
        }));
    }
});
exports.deleteTask = deleteTask;

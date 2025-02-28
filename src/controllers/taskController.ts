import { Request, Response } from "express";
import { Task } from "../models/board/task";
import CustomResponse from "../common/utils/error";
import { ObjectId } from "mongoose";
import { Board } from "../models/board/board";
import { get } from "lodash";

export const createTask = async (req: Request, res: Response) => {
  try {
    const lastTask = await Task.findOne({ userId: req.body.userId })
      .sort({ taskId: -1 })
      .select("taskId")
      .exec();

    const newTaskId = lastTask ? lastTask.taskId + 1 : 1;
    const board = await Board.findOne({ name: req.body.board }).lean();
    const task = new Task({
      ...req.body,
      taskId: newTaskId,
      board: board?._id,
    });

    await task.save();
    res
      .status(200)
      .send(
        new CustomResponse({ isSuccess: 1, message: "Created successfuly" }),
      );
  } catch (err) {
    console.log("createTask error", err);
    res
      .status(500)
      .send(
        new CustomResponse({
          isError: 1,
          message: "An error occurred while creating a task",
          payload: err,
        }),
      );
  }
};

export const getTasksForColumn = async (columnId: ObjectId) => {
  const tasks = await Task.find({ column: columnId }).populate("column").exec();
  return tasks;
};

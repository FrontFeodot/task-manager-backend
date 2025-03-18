import { Request, Response } from "express";
import { Task } from "../models/board/task";
import CustomResponse from "../common/utils/error";
import { ObjectId } from "mongoose";
import { Board } from "../models/board/board";
import { assign } from "lodash";

export const createTask = async (req: Request, res: Response) => {
  try {
    const lastTask = await Task.findOne({ userId: req.body.userId })
      .sort({ taskId: -1 })
      .select("taskId")
      .exec();

    const newTaskId = lastTask ? lastTask.taskId + 1 : 1;
    const task = new Task({
      ...req.body,
      taskId: newTaskId,
    });

    await task.save();
    res
      .status(200)
      .send(
        new CustomResponse({ isSuccess: 1, message: "Created successfuly" }),
      );
  } catch (err) {
    console.error("createTask error", err);
    res.status(500).send(
      new CustomResponse({
        isError: 1,
        message: "An error occurred while creating a task",
        payload: err,
      }),
    );
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const response = await Task.findOneAndUpdate(
      { userId: req.body.userId, taskId: req.body.taskId },
      {
        ...req.body,
        updatedAt: Date.now()
      },
    );
    if (response instanceof Error) {
      throw response;
    }
    res
      .status(200)
      .send(
        new CustomResponse({
          isSuccess: 1,
          message: "Task updated successfuly",
        }),
      );
  } catch (err) {
    console.error("Task update error", err);
    res
      .status(500)
      .send(new CustomResponse({ isError: 1, message: "Task update error" }));
  }
};

export const getTasksForColumn = async (columnId: ObjectId) => {
  const tasks = await Task.find({ columnId: columnId }).populate("column").exec();
  return tasks;
};

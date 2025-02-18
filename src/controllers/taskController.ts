import { Request, Response } from "express";
import { Task } from "../models/board/task";
import CustomError from "../common/utils/error";
import { ObjectId } from "mongoose";

export const createTask = async (req: Request, res: Response) => {
  try {
    const task = new Task(req.body);
    console.log("task", task);
    await task.save();
    res.status(200).send({ message: "Created successfuly" });
  } catch (err) {
    console.log("task", err);

    res
      .status(500)
      .json(new CustomError("An error occurred while creating a task"));
  }
};

export const getTasksForColumn = async (columnId: ObjectId) => {
  const tasks = await Task.find({ column: columnId }).populate("column").exec();
  return tasks;
};

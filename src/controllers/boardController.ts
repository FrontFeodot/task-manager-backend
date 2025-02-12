import { ObjectId } from "mongoose";
import { Column } from "../models/board/column";
import { Task } from "../models/board/task";
import { Request, Response } from "express";
import CustomError from "../common/utils/error";
import { IColumnDefault } from "../common/interfaces/models/IColumnSchema";
import { assign, reduce } from "lodash";

export const initDefaultBoard = async (userId: string) => {
  const defaultColumn = new Column({
    name: "Weekly planer",
    items: ["day", "week", "month", "quarter", "year"],
    userId,
  });
  try {
    await defaultColumn.save();
  } catch (err) {
    console.log(err);
  }
};

export const createColumn = async (name: string, timeframe: string) => {
  const column = new Column({ name, timeframe });
  await column.save();
  return column;
};

export const createTask = async (
  name: string,
  columnId: ObjectId,
  options = {},
) => {
  const task = new Task({ name, column: columnId, ...options });
  await task.save();
  return task;
};

export const getTasksForColumn = async (columnId: ObjectId) => {
  const tasks = await Task.find({ column: columnId }).populate("column").exec();
  return tasks;
};

export const getBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    if (!userId) {
      const { message } = new CustomError("userId is missing");
      res.status(401).send({ message });
    }
    const columns = await Column.find({ userId }).lean();
    const columnIds = columns.map((col) => col._id);

    const tasks = await Task.find({
      column: { $in: columnIds },
      userId: userId,
    })
      .populate("parentTask", "name")
      .lean();

    const board = reduce(
      columns,
      (result, column) => {
        return assign(result, {
          [column.name]: {
            ...column,
            tasks: tasks.filter(
              (task) => String(task.column) === String(column._id),
            ),
          },
        });
      },
      {},
    );

    res.status(200).json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching board" });
  }
};

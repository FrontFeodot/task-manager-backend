import { ObjectId } from "mongoose";
import { Column } from "../models/board/column";
import { Task } from "../models/board/task";
import { Request, Response } from "express";
import CustomError from "../common/utils/error";
import { assign, omit, pick, reduce } from "lodash";

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
      board: { $in: columnIds },
      userId: userId,
    }).lean();

    const board = reduce(
      columns,
      (result, column) => {
        return assign(result, {
          [column.name]: {
            ...omit(column, ["_v"]),
            tasks,
          },
        });
      },
      {},
    );

    res.status(200).json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json(new CustomError("Error fetching board"));
  }
};

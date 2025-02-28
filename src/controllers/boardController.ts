import { ObjectId } from "mongoose";
import { Board } from "../models/board/board";
import { Task } from "../models/board/task";
import { Request, Response } from "express";
import CustomResponse from "../common/utils/error";
import { assign, isError, map, omit, pick, reduce } from "lodash";

export const initDefaultBoard = async (userId: string) => {
  const defaultBoard = new Board({
    name: "Weekly planer",
    columns: ["day", "week", "month", "quarter", "year"],
    userId,
  });
  try {
    await defaultBoard.save();
  } catch (err) {
    console.log(err);
  }
};

export const createBoard = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    const board = new Board(data);
    await board.save();
    res
      .status(200)
      .send(new CustomResponse({ isSuccess: 1, message: "success" }));
  } catch (err) {
    res
      .status(500)
      .json(
        new CustomResponse({
          isError: 1,
          message: "An error occurred while creating a board",
        }),
      );
  }
};

export const getBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res
        .status(401)
        .send(new CustomResponse({ isError: 1, message: "userId is missing" }));
    }
    const boards = await Board.find({ userId }).lean();
    const boardIds = boards.map((col) => col._id);

    const tasks = await Task.find({
      board: { $in: boardIds },
      userId: userId,
    }).lean();

    const filteredTasks = map(tasks, (task) =>
      omit(task, ["userId", "_id", "__v"]),
    );

    const board = reduce(
      boards,
      (result, column) => {
        return assign(result, {
          [column.name]: {
            ...omit(column, ["userId", "_id", "__v"]),
            tasks: filteredTasks,
          },
        });
      },
      {},
    );

    res
      .status(200)
      .send(
        new CustomResponse({
          isSuccess: 1,
          message: "Success",
          payload: board,
        }),
      );
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        new CustomResponse({ isError: 1, message: "Error fetching board" }),
      );
  }
};

import { FlattenMaps, ObjectId } from "mongoose";
import { Board } from "../models/board/board";
import { Task } from "../models/board/task";
import { Request, Response } from "express";
import CustomResponse from "../common/utils/error";
import { assign, isError, map, omit, pick, reduce } from "lodash";
import { nanoid } from "nanoid";
import { ITask } from "../common/interfaces/models/ITaskSchema";
import { IBoard, IColumn } from "../common/interfaces/models/IBoardSchema";
import { getTaskForBoard } from "../common/utils/boardHelper";

export const initDefaultBoard = async (userId: string) => {
  const boardId = nanoid();
  const initColumnTitles = ["day", "week", "month", "quarter", "year"];
  const columns = map(initColumnTitles, (columnTitle, index) => {
    return {
      title: columnTitle,
      order: index + 1,
      columnId: nanoid(),
    };
  });
  const defaultBoard = new Board({
    title: "Weekly planer",
    boardId,
    columns,
    userId,
  });
  try {
    await defaultBoard.save();
  } catch (err) {
    console.error(err);
  }
};

export const createBoard = async (req: Request, res: Response) => {
  try {
    const { title, userId } = req.body;
    if (!title) {
      throw new CustomResponse({ isError: 1, message: "Missing title" });
    }
    const boardId = nanoid();
    const board = new Board({ title, boardId, userId, columns: [] });
    await board.save();
    res.status(200).send(
      new CustomResponse({
        isSuccess: 1,
        message: "Board created successfully",
      }),
    );
  } catch (err) {
    console.error(err);
    if (err instanceof CustomResponse) {
      res.status(500).send(err);
    }
    res.status(500).json(
      new CustomResponse({
        isError: 1,
        message: "An error occurred while creating a board",
      }),
    );
  }
};

export const updateBoardTitle = async (req: Request, res: Response) => {
  try {
    const { title, userId, boardId } = req.body;
    if (!title || !boardId) {
      throw new CustomResponse({ isError: 1, message: "Missing data" });
    }
    const updatedBoard = await Board.findOneAndUpdate(
      { userId, boardId },
      { title },
    );
    if (!updatedBoard) {
      throw new CustomResponse({
        isError: 1,
        message: "An error while updating the board",
      });
    }
    res.status(200).send(
      new CustomResponse({
        isSuccess: 1,
        message: "Board updated successfully",
      }),
    );
  } catch (err) {
    console.error(err);
    if (err instanceof CustomResponse) {
      res.status(500).send(err);
    }
    res.status(500).json(
      new CustomResponse({
        isError: 1,
        message: "An error occurred while updating a board",
      }),
    );
  }
};

export const deleteBoard = async (req: Request, res: Response) => {
  try {
    const { userId, boardId } = req.body;
    if (!boardId) {
      throw new CustomResponse({ isError: 1, message: "Missing board id" });
    }
    const deletedBoard = await Board.findOneAndDelete({ userId, boardId });

    const deletedTasks = await Task.deleteMany({ userId, boardId });

    if (!deletedBoard || !deletedTasks) {
      throw new CustomResponse({
        isError: 1,
        message: "An error while updating the board",
      });
    }
    res.status(200).send(
      new CustomResponse({
        isSuccess: 1,
        message: "Board deleted successfully",
      }),
    );
  } catch (err) {
    console.error(err);
    if (err instanceof CustomResponse) {
      res.status(500).send(err);
    }
    res.status(500).json(
      new CustomResponse({
        isError: 1,
        message: "An error occurred while deleting a board",
      }),
    );
  }
};

export const getBoardList = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res
        .status(401)
        .send(new CustomResponse({ isError: 1, message: "userId is missing" }));
    }
    const boards = await Board.find({ userId }).lean();
    const boardsIds = boards.map((board) => board.boardId);

    const tasks = await Task.find({
      boardId: boardsIds,
      userId: userId,
    }).lean();

    const board = reduce(
      boards,
      (result, boardItem) => {
        return assign(result, {
          [boardItem.title]: {
            ...omit(boardItem, ["userId", "_id", "__v"]),
            tasks: getTaskForBoard(tasks, boardItem.boardId),
          },
        });
      },
      {},
    );

    res.status(200).send(
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

export const updateTaskOrder = async (req: Request, res: Response) => {
  const tasksToUpdate = req.body.tasksToUpdate as {
    taskId: number;
    order: number;
    columnId: string;
    boardId: string;
  }[];

  if (!tasksToUpdate) {
    res
      .status(500)
      .send(new CustomResponse({ isError: 1, message: "missing data" }));
  }
  const updates = tasksToUpdate.map((item) => ({
    updateOne: {
      filter: { taskId: item.taskId, boardId: item.boardId },
      update: { $set: { order: item.order, columnId: item.columnId } },
    },
  }));

  try {
    const response = await Task.bulkWrite(updates);

    if (!response || response instanceof Error) {
      throw new CustomResponse({ isError: 1, message: "Saving error" });
    }
    await getBoardList(req, res);
  } catch (err) {
    console.error("updateTaskOrder", err);
  }
};

export const updateColumnOrder = async (req: Request, res: Response) => {
  const { columns, boardId } = req.body as {
    boardId: string;
    columns: IColumn[];
  };
  if (!columns || !boardId) {
    res
      .status(500)
      .send(new CustomResponse({ isError: 1, message: "missing data" }));
  }
  try {
    const response = await Board.findOneAndUpdate(
      { boardId: boardId },
      {
        columns,
      },
    );

    if (!response) {
      throw response;
    }
    await getBoardList(req, res);
  } catch (err) {
    console.error("Columns update error", err);
    res
      .status(500)
      .send(
        new CustomResponse({ isError: 1, message: "Columns update error" }),
      );
  }
};

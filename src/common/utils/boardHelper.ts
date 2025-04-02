import { Document, Types } from "mongoose";
import { Board } from "../../models/board/board";
import { IBoard } from "../interfaces/models/IBoardSchema";
import CustomResponse from "./error";
import { ITask } from "../interfaces/models/ITaskSchema";
import { omit, reduce } from "lodash";

export const getBoardHelper = async (
  userId: string,
  boardId: string,
): Promise<(Document & IBoard) | CustomResponse> => {
  try {
    const response = await Board.findOne({ boardId, userId }).exec();
    if (!response) {
      throw response;
    }
    return response;
  } catch (err) {
    return new CustomResponse({
      isError: 1,
      message: "Get board error",
      payload: err,
    }) as CustomResponse;
  }
};

export const getTaskForBoard = (
  tasks: ITask[],
  boardId: string,
): Partial<ITask>[] => {
  return reduce(
    tasks,
    (acc, task) => {
      if (task.boardId === boardId) {
        const filteredTask = omit(task, ["userId", "_id", "__v"]);
        acc.push(filteredTask);
      }
      return acc;
    },
    [] as Partial<ITask>[],
  );
};

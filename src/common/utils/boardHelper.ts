import omit from 'lodash/omit';
import reduce from 'lodash/reduce';
import { Document } from 'mongoose';

import { Board } from '@models/board/board';

import { IBoard } from '@common/interfaces/models/IBoardSchema';
import { ITask } from '@common/interfaces/models/ITaskSchema';

import CustomResponse from './error';

export const getBoardHelper = async (
  boardId: string
): Promise<(Document & IBoard) | CustomResponse> => {
  try {
    const response = await Board.findOne({ boardId }).exec();
    if (!response) {
      throw response;
    }
    return response;
  } catch (err) {
    return new CustomResponse({
      isError: 1,
      message: 'Get board error',
      payload: err,
    }) as CustomResponse;
  }
};

export const getTaskForBoard = (
  tasks: ITask[],
  boardId: string
): Partial<ITask>[] => {
  return reduce(
    tasks,
    (acc, task) => {
      if (task.boardId === boardId) {
        const filteredTask = omit(task, ['userId', '_id', '__v']);
        acc.push(filteredTask);
      }
      return acc;
    },
    [] as Partial<ITask>[]
  );
};

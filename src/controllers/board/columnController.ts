import map from 'lodash/map';
import omit from 'lodash/omit';
import some from 'lodash/some';
import { Document } from 'mongoose';
import { nanoid } from 'nanoid';

import { Task } from '@models/board/task';

import { IManageColumn } from '@common/interfaces/controllers/IColumnControllers';
import { IBoard, IColumn } from '@common/interfaces/models/IBoardSchema';
import { getIO } from '@common/socket';
import { getBoardHelper } from '@common/utils/boardHelper';
import CustomResponse from '@common/utils/error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BoardDoc = Document<unknown, any, any> & IBoard;

export const manageColumn = async ({
  title,
  boardId,
  order,
  columnId,
  isDelete,
  tasksPath,
}: IManageColumn): Promise<CustomResponse> => {
  try {
    if (!boardId || (!isDelete && !title)) {
      throw new CustomResponse({ isError: 1, message: 'Missing data' });
    }
    const board = await getBoardHelper(boardId);

    if (board instanceof CustomResponse) {
      throw board;
    }

    const isColumnCreate = !columnId && order;
    let updatedBoard;
    if (isDelete) {
      updatedBoard = await columnDelete(board, columnId, tasksPath);
    } else if (isColumnCreate) {
      updatedBoard = columnCreate(board, title, order);
    } else {
      if (!columnId) {
        throw new CustomResponse({ isError: 1, message: 'Missing columnId' });
      }
      const col = board.columns.get(columnId);
      col!.title = title;
      updatedBoard = board;
    }
    await updatedBoard.save();
    return new CustomResponse({
      isSuccess: 1,
      message: 'Column updated successfully',
      payload: { boardId, columns: board.columns },
    });
  } catch (err) {
    console.error(err);
    if (err instanceof CustomResponse) {
      return err;
    }
    return new CustomResponse({
      isError: 1,
      message: 'Create column errror',
      payload: err,
    });
  }
};

const columnCreate = (board: BoardDoc, title: string, order: number) => {
  const { columns } = board;
  const columnsArray = Array.from(columns.values());
  const isAlreadyExist = some(columnsArray, (column) => column.title === title);
  if (isAlreadyExist) {
    throw new CustomResponse({
      isError: 1,
      message: 'Column already exist, please choose another name',
    });
  }
  const newColumn = { title, order, columnId: nanoid() };
  board.columns.set(newColumn.columnId, newColumn);
  return board;
};

const columnDelete = async (
  board: BoardDoc,
  columnId?: string,
  tasksPath?: string
) => {
  if (!columnId) {
    throw new CustomResponse({
      isError: 1,
      message: 'Missing columnId',
    });
  }

  const { boardId } = board;
  if (tasksPath && tasksPath !== 'delete') {
    const lastTaskOrderInColumn = await Task.findOne({
      boardId,
      columnId: tasksPath,
    })
      .sort({ order: -1 })
      .exec();
    const tasksToUpdate = await Task.find({ columnId, boardId });

    const updates = map(tasksToUpdate, (item, index) => {
      let order = index + 1;
      if (lastTaskOrderInColumn?.order) {
        order = lastTaskOrderInColumn.order + index + 1;
      }
      return {
        updateOne: {
          filter: { taskId: item.taskId, boardId: item.boardId },
          update: { $set: { order, columnId: tasksPath } },
        },
      };
    });
    const response = await Task.bulkWrite(updates);

    if (!response) {
      throw new CustomResponse({
        isError: 1,
        message: 'Task update error',
      });
    }
    const updatedTasks = await Task.find({ columnId: tasksPath, boardId });
    const io = getIO();
    io.to(boardId).emit('multiplyTasksUpdated', {
      payload: {
        updatedTasks: map(updatedTasks, (task) =>
          omit(task, ['userId', '_id', '__v'])
        ),
        boardId: boardId,
      },
    });
  }
  if (tasksPath === 'delete') {
    await Task.deleteMany({ columnId, boardId });
  }

  const colsMap = board.columns as Map<string, IColumn>;
  if (!colsMap.has(columnId)) {
    throw new CustomResponse({ isError: 1, message: 'Column not found' });
  }

  colsMap.delete(columnId);
  board.markModified('columns');

  return board;
};

import CustomResponse from '../../common/utils/error';
import { filter, map, omit, some } from 'lodash';
import { nanoid } from 'nanoid';
import { getBoardHelper } from '../../common/utils/boardHelper';
import { Task } from '../../models/board/task';
import { IManageColumn } from '../../common/interfaces/controllers/IColumnControllers';
import { IBoard, IColumn } from '../../common/interfaces/models/IBoardSchema';
import { Document } from 'mongoose';
import { updateMultiplyTasks } from './taskController';
import { getIO } from '../../common/socket';

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

    const { columns } = board;
    const isColumnCreate = !columnId && order;
    let updatedBoard;
    if (isDelete) {
      updatedBoard = await columnDelete(board, columns, columnId, tasksPath);
    } else if (isColumnCreate) {
      updatedBoard = columnCreate(board, columns, title, order);
    } else {
      const updatedColumns = map(board.columns, (column) => {
        if (column.columnId === columnId) {
          return { ...column, title };
        }
        return column;
      });
      board.columns = updatedColumns;
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

const columnCreate = (
  board: BoardDoc,
  columns: IColumn[],
  title: string,
  order: number
) => {
  const isAlreadyExist = some(columns, (column) => column.title === title);
  if (isAlreadyExist) {
    throw new CustomResponse({
      isError: 1,
      message: 'Column already exist, please choose another name',
    });
  }
  const newColumn = { title, order, columnId: nanoid() };
  board.set('columns', [...columns, newColumn]);
  return board;
};

const columnDelete = async (
  board: BoardDoc,
  columns: IColumn[],
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

  const updatedColumns = filter(
    columns,
    (column) => column.columnId !== columnId
  );

  if (tasksPath) {
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
  } else {
    await Task.deleteMany({ columnId, boardId });
  }
  board.columns = updatedColumns;
  return board;
};

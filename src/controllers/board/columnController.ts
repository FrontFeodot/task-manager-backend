import { Request, Response } from 'express';
import CustomResponse from '../../common/utils/error';
import { Board } from '../../models/board/board';
import {
  filter,
  findIndex,
  map,
  some,
  sortBy,
} from 'lodash';
import { nanoid } from 'nanoid';
import { getBoardHelper } from '../../common/utils/boardHelper';
import { Task } from '../../models/board/task';
import { IManageColumn } from '../../common/interfaces/controllers/IColumnControllers';

export const manageColumn = async ({
  title,
  boardId,
  order,
  columnId,
  isDelete,
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
    const isColumnCreate = !columnId;

    if (isDelete) {
      if (!columnId) {
        throw new CustomResponse({
          isError: 1,
          message: 'Missing columnId',
        });
      }

      const updatedColumns = filter(
        columns,
        (column) => column.columnId !== columnId
      );
      board.columns = updatedColumns;
    }
    else if (isColumnCreate) {
      const isAlreadyExist = some(columns, (column) => column.title === title);
      if (isAlreadyExist) {
        throw new CustomResponse({
          isError: 1,
          message: 'Column already exist, please choose another name',
        });
      }
      const newColumn = { title, order, columnId: nanoid() };
      board.set('columns', [...columns, newColumn]);
    } else {
      const updatedColumns = map(board.columns, (column) => {
        if (column.columnId === columnId) {
          return { ...column, title };
        }
        return column;
      });
      board.columns = updatedColumns;
    }

    await board.save();
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

export const updateColumn = async (req: Request, res: Response) => {
  const { boardId, columnId, title } = req.body;
  try {
    const board = await getBoardHelper(boardId);

    if (board instanceof CustomResponse) {
      throw board;
    }

    const updatedColumns = map(board.columns, (column) => {
      if (column.columnId === columnId) {
        return { ...column, title };
      }
      return column;
    });
    board.columns = updatedColumns;
    board.save();

    res.status(200).send(
      new CustomResponse({
        isSuccess: 1,
        message: 'Column updated successfuly',
      })
    );
  } catch (err) {
    console.error('Column update error', err);
    if (err instanceof CustomResponse) {
      res.status(500).send(err);
      return;
    }
    res
      .status(500)
      .send(new CustomResponse({ isError: 1, message: 'Column update error' }));
  }
};

export const deleteColumn = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, boardId, columnId, tasksPath } = req.body;

  if (!req.body) {
    res
      .status(500)
      .send(new CustomResponse({ isError: 1, message: 'Missing data' }));
  }
  try {
    const board = await getBoardHelper(boardId);

    if (board instanceof CustomResponse) {
      throw board;
    }
    const removedColumn = findIndex(
      board.columns,
      (column) => column.columnId === columnId
    );
    board.columns.splice(removedColumn, 1);
    const sortedColumns = sortBy(board.columns, ['order']);

    const updatedColumns = map(sortedColumns, (column, index) => ({
      ...column,
      order: index + 1,
    }));

    board.columns = updatedColumns;

    if (tasksPath === 'delete') {
      await Task.deleteMany({ userId, columnId, boardId });
    } else {
      const lastTaskOrderInColumn = await Task.findOne({
        userId,
        boardId,
        columnId: tasksPath,
      })
        .sort({ order: -1 })
        .exec();
      const tasksToUpdate = await Task.find({ userId, columnId, boardId });

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
        throw new CustomResponse({ isError: 1, message: 'Task update error' });
      }
    }

    await board.save();
    res.status(200).send(
      new CustomResponse({
        isSuccess: 1,
        message: 'Column deleted successfully',
      })
    );
  } catch (err) {
    if (err instanceof CustomResponse) {
      res.status(500).send(err);
      return;
    }
    res.status(500).send(
      new CustomResponse({
        isError: 1,
        message: 'Something went wrong while deleting column',
        payload: err,
      })
    );
  }
};

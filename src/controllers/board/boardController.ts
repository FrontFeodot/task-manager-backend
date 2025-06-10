import { FlattenMaps, ObjectId } from 'mongoose';
import { Board } from '../../models/board/board';
import { Task } from '../../models/board/task';
import { Request, Response } from 'express';
import CustomResponse from '../../common/utils/error';
import {
  assign,
  filter,
  includes,
  isError,
  map,
  omit,
  pick,
  reduce,
  some,
} from 'lodash';
import { nanoid } from 'nanoid';
import { ITask } from '../../common/interfaces/models/ITaskSchema';
import { IBoard, IColumn } from '../../common/interfaces/models/IBoardSchema';
import { getTaskForBoard } from '../../common/utils/boardHelper';
import { User } from '../../models/user';

export const initDefaultBoard = async (userId: string, ownerEmail: string) => {
  const boardId = nanoid();
  const initColumnTitles = ['day', 'week', 'month', 'quarter', 'year'];
  const columns = map(initColumnTitles, (columnTitle, index) => {
    return {
      title: columnTitle,
      order: index + 1,
      columnId: nanoid(),
    };
  });
  const defaultBoard = new Board({
    title: 'Weekly planer',
    boardId,
    columns,
    userId,
    ownerEmail,
  });
  try {
    await defaultBoard.save();
  } catch (err) {
    console.error(err);
  }
};

export const getBoardList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      throw new CustomResponse({ isError: 1, message: 'UserId is missing' });
    }
    const user = await User.findOne({ userId });

    if (!user) {
      throw new CustomResponse({ isError: 1, message: 'User not found' });
    }

    const boards = await Board.find({
      $or: [{ userId }, { members: user.email }],
    }).lean();

    const boardsIds = boards.map((board) => board.boardId);

    const tasks = await Task.find({
      boardId: boardsIds,
    }).lean();

    const boardList = reduce(
      boards,
      (result, boardItem) => {
        return assign(result, {
          [boardItem.boardId]: {
            ...omit(boardItem, ['userId', '_id', '__v']),
            tasks: getTaskForBoard(tasks, boardItem.boardId),
          },
        });
      },
      {}
    );

    res.status(200).send(
      new CustomResponse({
        isSuccess: 1,
        message: 'Success',
        payload: boardList,
      })
    );
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        new CustomResponse({ isError: 1, message: 'Error fetching board' })
      );
  }
};

export const createBoard = async (req: Request, res: Response) => {
  try {
    const { title, userId } = req.body;
    if (!title) {
      throw new CustomResponse({ isError: 1, message: 'Missing title' });
    }
    const user = await User.findOne({ userId }).exec();

    if (!user) {
      throw new CustomResponse({ isError: 1, message: 'User not found' });
    }
    const boardId = nanoid();
    const board = new Board({
      title,
      ownerEmail: user.email,
      boardId,
      userId,
      columns: [],
    });
    await board.save();
    res.status(200).send(
      new CustomResponse({
        isSuccess: 1,
        message: 'Board created successfully',
        payload: boardId,
      })
    );
  } catch (err) {
    console.error(err);
    if (err instanceof CustomResponse) {
      res.status(500).send(err);
      return;
    }
    res.status(500).json(
      new CustomResponse({
        isError: 1,
        message: 'An error occurred while creating a board',
      })
    );
  }
};

export const updateBoardTitle = async (req: Request, res: Response) => {
  try {
    const { title, userId, boardId } = req.body;
    if (!title || !boardId) {
      throw new CustomResponse({ isError: 1, message: 'Missing data' });
    }
    const updatedBoard = await Board.findOneAndUpdate(
      { userId, boardId },
      { title }
    );
    if (!updatedBoard) {
      throw new CustomResponse({
        isError: 1,
        message: 'An error while updating the board',
      });
    }
    res.status(200).send(
      new CustomResponse({
        isSuccess: 1,
        message: 'Board updated successfully',
      })
    );
  } catch (err) {
    console.error(err);
    if (err instanceof CustomResponse) {
      res.status(500).send(err);
      return;
    }
    res.status(500).json(
      new CustomResponse({
        isError: 1,
        message: 'An error occurred while updating a board',
      })
    );
  }
};

export const deleteBoard = async (req: Request, res: Response) => {
  try {
    const { userId, boardId } = req.body;
    if (!boardId) {
      throw new CustomResponse({ isError: 1, message: 'Missing board id' });
    }
    const deletedBoard = await Board.findOneAndDelete({ userId, boardId });

    const deletedTasks = await Task.deleteMany({ userId, boardId });

    if (!deletedBoard || !deletedTasks) {
      throw new CustomResponse({
        isError: 1,
        message: 'An error while updating the board',
      });
    }
    res.status(200).send(
      new CustomResponse({
        isSuccess: 1,
        message: 'Board deleted successfully',
      })
    );
  } catch (err) {
    console.error(err);
    if (err instanceof CustomResponse) {
      res.status(500).send(err);
      return;
    }
    res.status(500).json(
      new CustomResponse({
        isError: 1,
        message: 'An error occurred while deleting a board',
      })
    );
  }
};

export const updateTaskOrder = async (req: Request, res: Response) => {
  const tasksToUpdate = req.body.tasksToUpdate as {
    taskId: number;
    order: number;
    columnId: string;
    boardId: string;
    isDone: string | null;
  }[];

  if (!tasksToUpdate) {
    res
      .status(500)
      .send(new CustomResponse({ isError: 1, message: 'missing data' }));
  }
  const updates = tasksToUpdate.map((item) => ({
    updateOne: {
      filter: { taskId: item.taskId, boardId: item.boardId },
      update: {
        $set: {
          order: item.order,
          columnId: item.columnId,
          isDone: item.isDone,
        },
      },
    },
  }));

  try {
    const response = await Task.bulkWrite(updates);

    if (!response || response instanceof Error) {
      throw new CustomResponse({ isError: 1, message: 'Saving error' });
    }
    await getBoardList(req, res);
  } catch (err) {
    console.error('updateTaskOrder', err);
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
      .send(new CustomResponse({ isError: 1, message: 'missing data' }));
  }
  try {
    const response = await Board.findOneAndUpdate(
      { boardId: boardId },
      {
        columns,
      }
    );

    if (!response) {
      throw response;
    }
    await getBoardList(req, res);
  } catch (err) {
    console.error('Columns update error', err);
    res
      .status(500)
      .send(
        new CustomResponse({ isError: 1, message: 'Columns update error' })
      );
  }
};

export const updateDoneColumn = async (req: Request, res: Response) => {
  const { doneColumn, boardId } = req.body;
  if (doneColumn === undefined || !boardId) {
    res
      .status(500)
      .send(new CustomResponse({ isError: 1, message: 'missing data' }));
  }

  try {
    const boardResponse = await Board.findOneAndUpdate(
      { boardId },
      { doneColumn }
    );

    if (doneColumn) {
      const tasksToUpdate = await Task.find({
        boardId,
        columnId: doneColumn,
        isDone: false,
      }).lean();

      const updates = map(tasksToUpdate, (item) => ({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { isDone: true } },
        },
      }));

      const tasksResponse = await Task.bulkWrite(updates);

      if (!tasksResponse) {
        throw tasksResponse;
      }
    }

    if (!boardResponse) {
      throw boardResponse;
    }
    await getBoardList(req, res);
  } catch (err) {
    console.error('Done column update error', err);
    res
      .status(500)
      .send(
        new CustomResponse({ isError: 1, message: 'Columns update error' })
      );
  }
};

export const shareBoard = async (req: Request, res: Response) => {
  console.log('shareBoard');
  try {
    const { userId, boardId, invitedUserEmail } = req.body;

    if (!boardId || !invitedUserEmail) {
      throw 'Missing data';
    }
    const board = await Board.findOne({ boardId }).exec();

    if (!board) {
      throw 'Board not exist';
    }

    if (board.userId !== userId) {
      throw 'Permission denied';
    }
    const invitedUser = await User.findOne({ email: invitedUserEmail }).exec();

    if (!invitedUser) {
      throw 'Invited user not found';
    }

    if (includes(board.members, invitedUserEmail)) {
      throw 'User already has access to this board';
    }

    board.members.push(invitedUserEmail);

    board.save();

    res.status(200).send(
      new CustomResponse({
        isSuccess: 1,
        message: 'Board shared successfuly',
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).send(
      new CustomResponse({
        isError: 1,
        message: `Sharing board error: ${err as string}`,
      })
    );
  }
};

export const leaveBoard = async (req: Request, res: Response) => {
  try {
    const { userId, boardId } = req.body;

    if (!boardId) {
      throw 'Missing data';
    }
    const board = await Board.findOne({ boardId }).exec();

    if (!board) {
      throw 'Board not exist';
    }

    if (board.userId === userId) {
      throw "You can't leave your own board";
    }
    const currentUser = await User.findOne({ userId }).exec();

    if (!currentUser) {
      throw 'User not found';
    }

    const updatedMembers = filter(
      board.members,
      (member) => member !== currentUser.email
    );

    board.members = updatedMembers;

    board.save();

    res.status(200).send(
      new CustomResponse({
        isSuccess: 1,
        message: 'Board leaved successfuly',
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).send(
      new CustomResponse({
        isError: 1,
        message: `Leaving board error: ${err as string}`,
      })
    );
  }
};
export const kickMember = async (req: Request, res: Response) => {
  try {
    const { userId, boardId, memberEmail } = req.body;

    if (!boardId || !memberEmail) {
      throw 'Missing data';
    }
    const board = await Board.findOne({ boardId }).exec();

    if (!board) {
      throw 'Board not exist';
    }

    if (board.userId !== userId) {
      throw 'Permission denied';
    }
    const kickedMember = await User.findOne({ email: memberEmail }).exec();

    if (!kickedMember) {
      throw 'Kicked member not found';
    }

    if (!includes(board.members, memberEmail)) {
      throw 'Member email is not exist on this board';
    }

    const updatedMembers = filter(
      board.members,
      (member) => member !== kickedMember.email
    );

    board.members = updatedMembers;

    board.save();

    res.status(200).send(
      new CustomResponse({
        isSuccess: 1,
        message: 'Board shared successfuly',
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).send(
      new CustomResponse({
        isError: 1,
        message: `Sharing board error: ${err as string}`,
      })
    );
  }
};

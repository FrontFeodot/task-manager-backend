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
import { IManageMembers } from '../../common/interfaces/controllers/IBoardControllers';

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
        payload: board,
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

export const updateBoardData = async (
  boardData: Partial<IBoard>
): Promise<CustomResponse> => {
  try {
    const { boardId } = boardData;
    if (!boardId) {
      throw new CustomResponse({ isError: 1, message: 'Missing data' });
    }
    const updatedBoard = await Board.findOneAndUpdate(
      { boardId },
      { ...boardData }
    );
    if (!updatedBoard) {
      throw new CustomResponse({
        isError: 1,
        message: 'An error while updating the board',
      });
    }
    return new CustomResponse({
      isSuccess: 1,
      message: 'Board updated successfully',
      payload: boardData,
    });
  } catch (err) {
    console.error(err);
    if (err instanceof CustomResponse) {
      return err;
    }
    return new CustomResponse({
      isError: 1,
      message: 'An error occurred while updating a board',
    });
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

export const manageMembers = async (
  membersData: IManageMembers,
  userId: string
) => {
  const { type, boardId, memberEmail } = membersData;

  try {
    if (!boardId || !memberEmail || !type) {
      throw 'Missing data';
    }
    const board = await Board.findOne({ boardId }).exec();

    if (!board) {
      throw 'Board not exist';
    }

    const user = await User.findOne({ email: memberEmail }).exec();

    if (!user) {
      throw 'User not found';
    }

    if ((type === 'share' || type === 'kick') && board.userId !== userId) {
      throw 'Permission denied';
    }

    if (type === 'leave' && board.userId === userId) {
      throw "You can't leave your own board";
    }

    if (type === 'share' && includes(board.members, memberEmail)) {
      throw 'User already has access to this board';
    }

    if (type === 'kick' && !includes(board.members, memberEmail)) {
      throw 'Member email is not exist on this board';
    }

    if (type === 'share') {
      board.members.push(memberEmail);
    }

    if (type === 'leave' || type === 'kick') {
      const updatedMembers = filter(
        board.members,
        (member) => member !== memberEmail
      );
      board.members = updatedMembers;
    }

    await board.save();
    return new CustomResponse({
      isSuccess: 1,
      message: 'success',
      payload: { boardId, members: board.members },
    });
  } catch (err) {
    console.error(err);

    if (typeof err === 'string') {
      return new CustomResponse({
        isError: 1,
        message: `Sharing board error: ${err as string}`,
      });
    }
    return new CustomResponse({
      isError: 1,
      message: 'Manage members error',
      payload: err,
    });
  }
};
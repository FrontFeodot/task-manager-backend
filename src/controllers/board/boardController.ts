import { Request, Response } from 'express';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import includes from 'lodash/includes';
import { nanoid } from 'nanoid';

import { Board } from '@models/board/board';
import { Task } from '@models/board/task';
import { User } from '@models/user';

import { IManageMembers } from '@common/interfaces/controllers/IBoardControllers';
import { IBoard, IColumn } from '@common/interfaces/models/IBoardSchema';
import { getBoardListPipeline } from '@common/utils/boardListAggregator';
import CustomResponse from '@common/utils/error';

export const initDefaultBoard = async (userId: string, ownerEmail: string) => {
  const boardId = nanoid();
  const initColumnTitles = ['day', 'week', 'month', 'quarter', 'year'];
  const columns = new Map<string, IColumn>();

  forEach(initColumnTitles, (columnTitle, index) => {
    const columnId = nanoid();
    columns.set(columnId, {
      title: columnTitle,
      order: index + 1,
      columnId,
    });
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

export const getBoardList = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const user = await User.findOne({ userId });
    if (!user) throw new Error('User not found');

    const pipeline = getBoardListPipeline({ userId, userEmail: user.email });

    const [boardList] = await Board.aggregate(pipeline);

    res.status(200).send(
      new CustomResponse({
        isSuccess: 1,
        message: 'Board list fetched successfuly',
        payload: boardList,
      })
    );
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        new CustomResponse({ isError: 1, message: 'Error fetching boards' })
      );
  }
};

export const getSingleBoard = async (req: Request, res: Response) => {
  const boardId = req.query.boardId as string;
  try {
    if (!boardId) {
      throw new CustomResponse({ isError: 1, message: 'Missing board id' });
    }
    const pipeline = getBoardListPipeline({ boardId });

    const [board] = await Board.aggregate(pipeline);

    if (!board) {
      throw new CustomResponse({ isError: 1, message: 'Board not found' });
    }

    res.status(200).send(
      new CustomResponse({
        isSuccess: 1,
        message: 'Board fetched successfuly',
        payload: board[boardId],
      })
    );
  } catch (err) {
    console.error(err);
    if (err instanceof CustomResponse) {
      res.status(500).send(err);
      return;
    }
    res.status(500).send(
      new CustomResponse({
        isError: 1,
        message: 'Error fetching board',
        payload: err,
      })
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

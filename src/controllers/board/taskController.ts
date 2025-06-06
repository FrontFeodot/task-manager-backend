import { Request, Response } from 'express';
import { Task } from '../../models/board/task';
import CustomResponse from '../../common/utils/error';
import { ObjectId } from 'mongoose';
import { Board } from '../../models/board/board';
import { assign } from 'lodash';

export const createTask = async (req: Request, res: Response) => {
  try {
    const lastTask = await Task.findOne({ userId: req.body.userId })
      .sort({ taskId: -1 })
      .select('taskId')
      .exec();

    const newTaskId = lastTask ? lastTask.taskId + 1 : 1;
    const task = new Task({
      ...req.body,
      taskId: newTaskId,
    });

    await task.save();
    res
      .status(200)
      .send(
        new CustomResponse({ isSuccess: 1, message: 'Created successfuly' })
      );
  } catch (err) {
    console.error('createTask error', err);
    res.status(500).send(
      new CustomResponse({
        isError: 1,
        message: 'An error occurred while creating a task',
        payload: err,
      })
    );
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const { boardId, taskId } = req.body;
  try {
    const response = await Task.findOneAndUpdate(
      { taskId, boardId },
      {
        ...req.body,
        ...(req.body.type === 'story' && req.body.parentTask
          ? {
              parentTask: null,
            }
          : {}),
        updatedAt: Date.now(),
      }
    );
    if (response instanceof Error) {
      throw response;
    }
    res.status(200).send(
      new CustomResponse({
        isSuccess: 1,
        message: 'Task updated successfuly',
      })
    );
  } catch (err) {
    console.error('Task update error', err);
    res
      .status(500)
      .send(new CustomResponse({ isError: 1, message: 'Task update error' }));
  }
};

export const getTasksForColumn = async (columnId: ObjectId) => {
  const tasks = await Task.find({ columnId: columnId })
    .populate('column')
    .exec();
  return tasks;
};

export const deleteTask = async (req: Request, res: Response) => {
  const { userId, boardId, taskId } = req.body;
  try {
    const response = await Task.findOneAndDelete({ userId, taskId, boardId });
    if (!response || response instanceof Error) {
      throw response;
    }

    res
      .status(200)
      .send(
        new CustomResponse({ isSuccess: 1, message: 'Task delete successful' })
      );
  } catch (err) {
    console.error('Task delete error: ', err);
    res.status(500).send(
      new CustomResponse({
        isError: 1,
        message: 'Task delete err',
        payload: err,
      })
    );
  }
};

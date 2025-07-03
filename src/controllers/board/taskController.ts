import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';

import { Counter } from '@models/board/counter';
import { Task } from '@models/board/task';

import { ITask } from '@common/interfaces/models/ITaskSchema';
import {
  taskDeletedEvent,
  taskUpdatedEvent,
} from '@common/socket/handlers/tasksEvents';
import CustomResponse from '@common/utils/error';

export const updateMultiplyTasks = async (
  tasksToUpdate: Partial<ITask>[],
  boardId: string
) => {
  if (!tasksToUpdate) {
    throw new CustomResponse({ isError: 1, message: 'missing data' });
  }
  const updates = tasksToUpdate.map((item) => ({
    updateOne: {
      filter: { taskId: item.taskId, boardId: boardId },
      update: {
        $set: {
          ...item,
        },
      },
    },
  }));

  try {
    const response = await Task.bulkWrite(updates);
    if (!response || response instanceof Error) {
      throw new CustomResponse({ isError: 1, message: 'Saving error' });
    }
    return new CustomResponse({
      isSuccess: 1,
      message: 'Tasks updated successfully',
      payload: tasksToUpdate,
    });
  } catch (err) {
    console.error('updateMultiplyTasks', err);
    if (err instanceof CustomResponse) return err;
    return new CustomResponse({
      isError: 1,
      message: 'Updating tasks error',
      payload: err,
    });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const counterName = `task_${req.body.boardId}`;

    const counter = await Counter.findOneAndUpdate(
      { name: counterName },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    const newTaskId = counter.seq;

    const task = new Task({
      ...req.body,
      taskId: newTaskId,
    });

    await task.save();
    taskUpdatedEvent(task, true);
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
  const taskToUpdate = req.body;
  const { boardId, taskId } = taskToUpdate;
  try {
    const task = await Task.findOneAndUpdate(
      { taskId, boardId },
      {
        ...taskToUpdate,
        ...(taskToUpdate.type === 'story' && taskToUpdate.parentTask
          ? {
              parentTask: null,
            }
          : {}),
        updatedAt: Date.now(),
      }
    );
    if (!task || task instanceof Error) {
      throw task;
    }
    taskUpdatedEvent(taskToUpdate);

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
  const { boardId, taskId } = req.body;
  try {
    const response = await Task.findOneAndDelete({ taskId, boardId });
    if (!response || response instanceof Error) {
      throw response;
    }

    res
      .status(200)
      .send(
        new CustomResponse({ isSuccess: 1, message: 'Task delete successful' })
      );
    taskDeletedEvent(taskId, boardId);
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

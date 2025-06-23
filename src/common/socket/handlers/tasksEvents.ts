import { omit } from 'lodash';
import { getIO } from '..';
import { ITask } from '../../interfaces/models/ITaskSchema';
import CustomResponse from '../../utils/error';

export const taskUpdatedEvent = (task: ITask, isCreate?: boolean) => {
  const io = getIO();

  const response = new CustomResponse({
    isSuccess: 1,
    message: `Task ${isCreate ? 'created' : 'updated'}`,
    payload: omit(task, ['userId', '_id', '__v']),
  });
  io.to(task.boardId).emit('taskUpdated', response);
};

export const taskDeletedEvent = (taskId: string, boardId: string) => {
  const io = getIO();

  const response = new CustomResponse({
    isSuccess: 1,
    message: `Task deleted`,
    payload: { taskId, boardId },
  });
  io.to(boardId).emit('taskDeleted', response);
};

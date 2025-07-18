import { Socket } from 'socket.io';

import { updateMultiplyTasks } from '@controllers/board/taskController';

import { IAckCallback } from '@common/interfaces/ISocket';
import { ITask } from '@common/interfaces/models/ITaskSchema';

const tasksSocketHandlers = (socket: Socket) => {
  socket.on(
    'updateMultiplyTasks',
    async (
      boardId: string,
      tasksToUpdate: Partial<ITask>[],
      callback: IAckCallback
    ) => {
      const response = await updateMultiplyTasks(tasksToUpdate, boardId);
      const payload = {
        ...response,
        payload: { updatedTasks: response.payload, boardId },
      };

      callback(payload);

      if (response.isError) return;

      socket.broadcast.to(boardId).emit('multiplyTasksUpdated', payload);
    }
  );
};

export default tasksSocketHandlers;

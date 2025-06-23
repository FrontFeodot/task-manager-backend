import { Server as IOServer, Socket } from 'socket.io';
import { IAckCallback } from '../../interfaces/ISocket';
import { updateMultiplyTasks } from '../../../controllers/board/taskController';
import { ITask } from '../../interfaces/models/ITaskSchema';

const tasksSocketHandlers = (socket: Socket, io: IOServer) => {
  socket.on(
    'updateMultiplyTasks',
    async (
      boardId: string,
      tasksToUpdate: Partial<ITask>[],
      callback: IAckCallback
    ) => {
      const response = await updateMultiplyTasks(tasksToUpdate);
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

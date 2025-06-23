import { Server as IOServer, Socket } from 'socket.io';
import { IUpdateTaskOrder } from '../../interfaces/controllers/ITaskControllers';
import { IAckCallback } from '../../interfaces/ISocket';
import { updateMultiplyTasks } from '../../../controllers/board/taskController';
import { ITask } from '../../interfaces/models/ITaskSchema';
import { getIO } from '..';
import CustomResponse from '../../utils/error';
import { omit } from 'lodash';

const tasksSocketHandlers = (socket: Socket, io: IOServer) => {
  socket.on(
    'updateMultiplyTasks',
    async (
      boardId: string,
      tasksToUpdate: Partial<ITask>[],
      callback: IAckCallback
    ) => {
      const response = await updateMultiplyTasks(tasksToUpdate);

      callback(response);
      console.log('updateMultiplyTasks event response => ', response);
      if (response.isError) return;

      io.to(boardId).emit('multiplyTasksUpdated', {
        ...response,
        payload: { updatedTasks: response.payload, boardId },
      });
    }
  );
};

export default tasksSocketHandlers;

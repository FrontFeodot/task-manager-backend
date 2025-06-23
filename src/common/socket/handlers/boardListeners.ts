import { Server as IOServer, Socket } from 'socket.io';

import { manageMembers, updateBoardData } from '@controllers/board/boardController';
import { manageColumn } from '@controllers/board/columnController';

import { IManageMembers } from '@common/interfaces/controllers/IBoardControllers';
import { IManageColumn } from '@common/interfaces/controllers/IColumnControllers';
import { IAckCallback } from '@common/interfaces/ISocket';
import { IBoard } from '@common/interfaces/models/IBoardSchema';
import CustomResponse from '@common/utils/error';

const boardSocketHandlers = (socket: Socket, io: IOServer) => {
  socket.on('joinBoard', (boardId: string, callback: IAckCallback) => {
    if (socket.rooms.has(boardId)) {
      return callback(
        new CustomResponse({
          isError: 1,
          message: 'You already joined to this room',
        })
      );
    }
    if (socket.data.currentRoom) {
      socket.leave(socket.data.currentRoom);
    }
    socket.join(boardId);
    socket.data.currentRoom = boardId;
    console.log(`${socket.id} joined board`, boardId);
  });

  socket.on(
    'updateBoardData',
    async (boardData: Partial<IBoard>, callback: IAckCallback) => {
      const response = await updateBoardData(boardData);

      callback(response);
      if (response.isError) return;

      socket.broadcast.to(boardData.boardId!).emit('boardDataUpdated', boardData);
    }
  );

  socket.on('manageColumn', async (columnData: IManageColumn, callback) => {
    const response = await manageColumn(columnData);
    callback(response);
    if (response.isError) return;

    socket.broadcast.to(columnData.boardId!).emit('boardDataUpdated', response.payload);
  });

  socket.on('manageMembers', async (membersData: IManageMembers, callback) => {
    const response = await manageMembers(membersData, socket.data.userId);
    callback(response);
    if (response.isError) return;

    socket.broadcast.to(membersData.boardId!).emit('boardDataUpdated', response.payload);
  });
};

export default boardSocketHandlers;

import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';

import { verifyJwt } from '../utils/authHelper';
import boardSocketHandlers from './handlers/boardListeners';
import tasksSocketHandlers from './handlers/tasksListeners';

let io: IOServer;

export const initSocket = (server: HttpServer) => {
  io = new IOServer(server, {
    cors: { origin: '*' },
    pingInterval: 10000,
    pingTimeout: 5000,
    connectionStateRecovery: {
      maxDisconnectionDuration: 30000,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const payload = verifyJwt(token);
      socket.data.userId = payload;
      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('New WS connection:', socket.id);
    boardSocketHandlers(socket, io);
    tasksSocketHandlers(socket, io);

    socket.on('disconnect', (reason) => {
      console.log(`WS disconnected (${reason}):`, socket.id);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });

  return io;
};

export function getIO(): IOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
}

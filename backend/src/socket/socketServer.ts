/**
 * backend/src/socket/socketServer.ts
 * ----------------------------------
 * Socket.IO configuration and real-time event handlers.
 */

import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

export function initializeSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

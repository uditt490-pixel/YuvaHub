import { getSocketIO } from "../api/socketInstance.js";
import { dbCommand } from "../api/db.js";

export const setupSocketEvents = () => {
  const io = getSocketIO();
  if (!io) return;

  io.on("connection", (socket: any) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    socket.on("joinTeamRoom", (teamId: string) => {
      socket.join(`team_${teamId}`);
      console.log(`[Socket] User ${socket.id} joined team_${teamId}`);
    });

    socket.on("leaveTeamRoom", (teamId: string) => {
      socket.leave(`team_${teamId}`);
      console.log(`[Socket] User ${socket.id} left team_${teamId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });
};

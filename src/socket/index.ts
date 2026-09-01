import { getSocketIO } from "../api/socketInstance.js";
import { dbCommand } from "../api/db.js";
import { setupFocusRoom } from "./focusRoom.js";
import { setupStudyGroupPresence } from "./studyGroupPresence.js";
import { setupMockInterviewCollab } from "./mockInterviewCollab.js";
import { setupCareerFairPresence } from "./careerFairPresence.js";

export const setupSocketEvents = () => {
  const io = getSocketIO();
  if (!io) return;

  setupFocusRoom(io as any); // io instance, cast to any to avoid type complaints if versions differ, though Server should match.
  setupStudyGroupPresence(io as any);
  setupMockInterviewCollab(io as any);
  setupCareerFairPresence(io as any);

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

    socket.on("joinDmRoom", (userId: string) => {
      socket.join(`dm_${userId}`);
      console.log(`[Socket] User ${socket.id} joined dm_${userId}`);
    });

    socket.on("leaveDmRoom", (userId: string) => {
      socket.leave(`dm_${userId}`);
      console.log(`[Socket] User ${socket.id} left dm_${userId}`);
    });

    socket.on("joinForumPostRoom", (postId: string) => {
      socket.join(`post_${postId}`);
      console.log(`[Socket] User ${socket.id} joined post_${postId}`);
    });

    socket.on("leaveForumPostRoom", (postId: string) => {
      socket.leave(`post_${postId}`);
      console.log(`[Socket] User ${socket.id} left post_${postId}`);
    });

    socket.on("joinEventRoom", (eventId: string) => {
      socket.join(`event_${eventId}`);
      console.log(`[Socket] User ${socket.id} joined event_${eventId}`);
    });

    socket.on("leaveEventRoom", (eventId: string) => {
      socket.leave(`event_${eventId}`);
      console.log(`[Socket] User ${socket.id} left event_${eventId}`);
    });

    socket.on("draw_event", (data: any) => {
      // Broadcast to other users. If team/room-based is needed later, we'd use `socket.to(room).emit`.
      // For now, broadcast to everyone else to satisfy the generic real-time requirement.
      socket.broadcast.emit("draw_event", data);
    });

    socket.on("disconnect", () => {
      socket.removeAllListeners();
      socket.leaveAll();
      console.log(`[Socket] Cleaned up listeners for socket ${socket.id}`);
    });
  });
};

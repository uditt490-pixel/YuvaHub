import { Server, Socket } from "socket.io";

// Track users in study groups by socket ID to handle disconnects cleanly
// Record structure: socket.id -> { roomId: string, user: { uid: string, name: string, avatarUrl?: string } }
const userPresenceMap = new Map<string, { roomId: string; user: any }>();

export const setupStudyGroupPresence = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    socket.on("join_study_group", ({ roomId, user }: { roomId: string; user: any }) => {
      if (!roomId || !user) return;
      
      const roomString = `study_group_${roomId}`;
      socket.join(roomString);
      
      userPresenceMap.set(socket.id, { roomId, user });
      
      // Broadcast to others in the room that a member joined
      socket.to(roomString).emit("member_joined", { user });
      console.log(`[Socket] User ${user.name} joined study group ${roomId}`);
    });

    socket.on("leave_study_group", ({ roomId, user }: { roomId: string; user: any }) => {
      if (!roomId || !user) return;
      
      const roomString = `study_group_${roomId}`;
      socket.leave(roomString);
      
      userPresenceMap.delete(socket.id);
      
      // Broadcast to others in the room that a member left
      socket.to(roomString).emit("member_left", { uid: user.uid });
      console.log(`[Socket] User ${user.name} left study group ${roomId}`);
    });

    socket.on("disconnect", () => {
      const presence = userPresenceMap.get(socket.id);
      if (presence) {
        const { roomId, user } = presence;
        const roomString = `study_group_${roomId}`;
        
        io.to(roomString).emit("member_left", { uid: user.uid });
        userPresenceMap.delete(socket.id);
        console.log(`[Socket] User ${user.name} disconnected from study group ${roomId}`);
      }
    });
  });
};

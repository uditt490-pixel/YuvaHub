export const setupMockInterviewCollab = (io: any) => {
  const namespace = io.of("/mock-interview");

  namespace.on("connection", (socket: any) => {
    console.log(`[Socket/MockInterview] User connected: ${socket.id}`);

    socket.on("joinSession", (sessionId: string) => {
      socket.join(`session_${sessionId}`);
      console.log(`[Socket/MockInterview] User ${socket.id} joined session_${sessionId}`);
      socket.to(`session_${sessionId}`).emit("peerJoined", socket.id);
    });

    socket.on("codeChange", ({ sessionId, content }: { sessionId: string; content: string }) => {
      socket.to(`session_${sessionId}`).emit("codeUpdate", { content });
    });

    socket.on("leaveSession", (sessionId: string) => {
      socket.leave(`session_${sessionId}`);
      console.log(`[Socket/MockInterview] User ${socket.id} left session_${sessionId}`);
      socket.to(`session_${sessionId}`).emit("peerLeft", socket.id);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket/MockInterview] User disconnected: ${socket.id}`);
    });
  });
};

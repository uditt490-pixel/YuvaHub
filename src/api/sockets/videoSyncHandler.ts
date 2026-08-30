export const registerVideoSyncHandlers = (io: any, socket: any) => {
  // Join room container boundary
  socket.on('join_study_room', ({ roomId, userId, username }: { roomId: string; userId: string; username?: string }) => {
    socket.join(`room:${roomId}`);
    socket.roomId = roomId;
    socket.userId = userId;

    // Notify existing peers to initiate WebRTC handshake
    socket.to(`room:${roomId}`).emit('peer_joined', { userId, username, socketId: socket.id });
  });

  // Relay WebRTC signaling payloads (Offers, Answers, and ICE Candidates)
  socket.on('webrtc_signal', ({ targetSocketId, signalData }: { targetSocketId: string; signalData: any }) => {
    io.to(targetSocketId).emit('webrtc_signal_received', {
      senderSocketId: socket.id,
      signalData
    });
  });

  // Broadcast text snippets/code editor modifications
  socket.on('editor_change', ({ content }: { content: string }) => {
    if (socket.roomId) {
      socket.to(`room:${socket.roomId}`).emit('editor_update', { content });
    }
  });

  // Relay hardware presence state tracks (Mute / Camera off toggles)
  socket.on('media_state_change', ({ audioMuted, videoMuted }: { audioMuted: boolean; videoMuted: boolean }) => {
    if (socket.roomId) {
      socket.to(`room:${socket.roomId}`).emit('peer_media_state', {
        userId: socket.userId,
        audioMuted,
        videoMuted
      });
    }
  });

  // Clean layout context on unexpected drops
  socket.on('disconnect', () => {
    if (socket.roomId) {
      socket.to(`room:${socket.roomId}`).emit('peer_left', { socketId: socket.id, userId: socket.userId });
    }
  });
};

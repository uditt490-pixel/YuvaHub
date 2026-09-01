module.exports = (io, socket) => {
  // Join room container boundary
  socket.on('join_study_room', ({ roomId, userId, username }) => {
    socket.join(`room:${roomId}`);
    socket.roomId = roomId;
    socket.userId = userId;

    // Notify existing peers to initiate WebRTC handshake
    socket.to(`room:${roomId}`).emit('peer_joined', { userId, username, socketId: socket.id });
  });

  // Relay WebRTC signaling payloads (Offers, Answers, and ICE Candidates)
  socket.on('webrtc_signal', ({ targetSocketId, signalData }) => {
    io.to(targetSocketId).emit('webrtc_signal_received', {
      senderSocketId: socket.id,
      signalData
    });
  });

  // Broadcast text snippets/code editor modifications
  socket.on('editor_change', ({ content }) => {
    if (socket.roomId) {
      socket.to(`room:${socket.roomId}`).emit('editor_update', { content });
    }
  });

  // Relay hardware presence state tracks (Mute / Camera off toggles)
  socket.on('media_state_change', ({ audioMuted, videoMuted }) => {
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

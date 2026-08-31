import { Thread, Comment } from '../models/Forum.js';

export const setupForumSockets = (io) => {
  // Create a dedicated namespace for the forum
  const forumNamespace = io.of('/forum');

  forumNamespace.on('connection', (socket) => {
    console.log(`User connected to forum namespace: ${socket.id}`);

    // Listen for a user joining a specific thread's "room"
    socket.on('joinThread', (threadId) => {
      socket.join(threadId);
      console.log(`Socket ${socket.id} joined thread: ${threadId}`);
    });

    // Listen for a user leaving a thread
    socket.on('leaveThread', (threadId) => {
      socket.leave(threadId);
      console.log(`Socket ${socket.id} left thread: ${threadId}`);
    });

    // Listen for a new comment being posted
    socket.on('postComment', (commentData) => {
      // Broadcast the new comment to EVERYONE currently in that thread's room
      forumNamespace.to(commentData.threadId).emit('newCommentReceived', commentData);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected from forum: ${socket.id}`);
    });
  });
};

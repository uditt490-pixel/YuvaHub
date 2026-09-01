import mongoose from 'mongoose';
import TeamWorkspace from '../models/TeamWorkspace.js';

export default function configureWorkspaceSockets(io) {
  const workspaceNamespace = io.of ? io.of('/api/ws/workspace') : io;

  workspaceNamespace.on('connection', (socket) => {
    // 1. Join room on credential verification
    socket.on('join-workspace', async ({ workspaceId, userId }) => {
      socket.join(workspaceId);
      socket.workspaceId = workspaceId;
      socket.userId = userId;
    });

    // 2. Real-time Notepad Mutation Synchronization
    socket.on('edit-notepad', async ({ text }) => {
      if (socket.workspaceId) {
        socket.to(socket.workspaceId).emit('notepad-updated', { text });
        if (mongoose.connection.readyState === 1) {
          try {
            await TeamWorkspace.updateOne({ teamId: socket.workspaceId }, { $set: { notepad: text } });
          } catch (err) {
            console.error('Error persisting notepad mutation:', err);
          }
        }
      }
    });

    // 3. Real-time Task Checklist Toggle Integration
    socket.on('toggle-task', async ({ taskId, completed }) => {
      if (socket.workspaceId) {
        if (mongoose.connection.readyState === 1) {
          try {
            await TeamWorkspace.updateOne(
              { teamId: socket.workspaceId, 'checklist.id': taskId },
              { $set: { 'checklist.$.completed': completed, 'checklist.$.updatedBy': socket.userId } }
            );
          } catch (err) {
            console.error('Error persisting task toggle:', err);
          }
        }

        socket.to(socket.workspaceId).emit('task-toggled', { taskId, completed, updatedBy: socket.userId });
      }
    });

    socket.on('disconnect', () => {
      if (socket.workspaceId) {
        socket.leave(socket.workspaceId);
      }
    });
  });
}
export { configureWorkspaceSockets };

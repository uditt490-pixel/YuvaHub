import mongoose from 'mongoose';
import { TeamWorkspace } from '../../models/TeamWorkspace.js';

export const configureWorkspaceSockets = (io: any) => {
  const workspaceNamespace = io.of ? io.of('/api/ws/workspace') : io;

  workspaceNamespace.on('connection', (socket: any) => {
    socket.on('join-workspace', async ({ workspaceId, userId }: { workspaceId: string; userId: string }) => {
      socket.join(workspaceId);
      socket.workspaceId = workspaceId;
      socket.userId = userId;
    });

    socket.on('edit-notepad', async ({ text }: { text: string }) => {
      if (socket.workspaceId) {
        socket.to(socket.workspaceId).emit('notepad-updated', { text });
        if (mongoose.connection.readyState === 1) {
          try {
            await (TeamWorkspace as any).updateOne({ teamId: socket.workspaceId }, { $set: { notepad: text } });
          } catch (err) {
            console.error('Error persisting notepad mutation:', err);
          }
        }
      }
    });

    socket.on('toggle-task', async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      if (socket.workspaceId) {
        if (mongoose.connection.readyState === 1) {
          try {
            await (TeamWorkspace as any).updateOne(
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
};

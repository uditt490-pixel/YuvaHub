import { describe, it, expect, vi, beforeEach } from 'vitest';
import configureWorkspaceSockets from '../backend/sockets/workspaceSocket.js';
import { configureWorkspaceSockets as configureWorkspaceSocketsTs } from '../src/api/sockets/workspaceSocket.js';

describe('Automated Hackathon Idea Generator & Team Workspace (#922)', () => {
  let mockIo: any;
  let mockSocket: any;
  let eventHandlers: Record<string, Function>;

  beforeEach(() => {
    eventHandlers = {};
    mockIo = {
      of: vi.fn().mockReturnThis(),
      on: vi.fn((event: string, connectionHandler: Function) => {
        if (event === 'connection') {
          connectionHandler(mockSocket);
        }
      }),
    };
    mockSocket = {
      id: 'socket_team_101',
      join: vi.fn(),
      leave: vi.fn(),
      to: vi.fn().mockReturnValue({
        emit: vi.fn(),
      }),
      on: vi.fn((event: string, handler: Function) => {
        eventHandlers[event] = handler;
      }),
    };
  });

  it('should handle join-workspace and attach workspaceId', () => {
    configureWorkspaceSockets(mockIo);

    expect(eventHandlers['join-workspace']).toBeDefined();
    eventHandlers['join-workspace']({ workspaceId: 'ws_alpha_team', userId: 'user_456' });

    expect(mockSocket.join).toHaveBeenCalledWith('ws_alpha_team');
    expect(mockSocket.workspaceId).toBe('ws_alpha_team');
    expect(mockSocket.userId).toBe('user_456');
  });

  it('should broadcast notepad-updated on edit-notepad', async () => {
    configureWorkspaceSockets(mockIo);

    eventHandlers['join-workspace']({ workspaceId: 'ws_alpha_team', userId: 'user_456' });
    await eventHandlers['edit-notepad']({ text: 'Updated architecture notes' });

    const toEmitMock = mockSocket.to('ws_alpha_team').emit;
    expect(toEmitMock).toHaveBeenCalledWith('notepad-updated', { text: 'Updated architecture notes' });
  });

  it('should broadcast task-toggled on toggle-task', async () => {
    configureWorkspaceSockets(mockIo);

    eventHandlers['join-workspace']({ workspaceId: 'ws_alpha_team', userId: 'user_789' });
    await eventHandlers['toggle-task']({ taskId: 'task_2', completed: true });

    const toEmitMock = mockSocket.to('ws_alpha_team').emit;
    expect(toEmitMock).toHaveBeenCalledWith('task-toggled', {
      taskId: 'task_2',
      completed: true,
      updatedBy: 'user_789',
    });
  });

  it('should leave room on disconnect', () => {
    configureWorkspaceSockets(mockIo);

    eventHandlers['join-workspace']({ workspaceId: 'ws_alpha_team', userId: 'user_789' });
    eventHandlers['disconnect']();

    expect(mockSocket.leave).toHaveBeenCalledWith('ws_alpha_team');
  });

  it('should configure TypeScript workspace sockets identically', () => {
    configureWorkspaceSocketsTs(mockIo);
    expect(eventHandlers['join-workspace']).toBeDefined();
    expect(eventHandlers['edit-notepad']).toBeDefined();
    expect(eventHandlers['toggle-task']).toBeDefined();
    expect(eventHandlers['disconnect']).toBeDefined();
  });
});

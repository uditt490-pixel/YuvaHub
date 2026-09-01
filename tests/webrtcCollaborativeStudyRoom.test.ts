import { describe, it, expect, vi, beforeEach } from 'vitest';
import videoSyncHandler from '../backend/sockets/videoSyncHandler.js';
import { registerVideoSyncHandlers } from '../src/api/sockets/videoSyncHandler.js';

describe('WebRTC Collaborative Study Room & Peer Mentorship (#895)', () => {
  let mockIo: any;
  let mockSocket: any;
  let eventHandlers: Record<string, Function>;

  beforeEach(() => {
    eventHandlers = {};
    mockIo = {
      to: vi.fn().mockReturnValue({
        emit: vi.fn(),
      }),
    };
    mockSocket = {
      id: 'socket_12345',
      join: vi.fn(),
      to: vi.fn().mockReturnValue({
        emit: vi.fn(),
      }),
      on: vi.fn((event: string, handler: Function) => {
        eventHandlers[event] = handler;
      }),
    };
  });

  it('should handle join_study_room and notify room peers', () => {
    videoSyncHandler(mockIo, mockSocket);

    expect(eventHandlers['join_study_room']).toBeDefined();

    const joinPayload = { roomId: 'room_algos_101', userId: 'user_001', username: 'milan_dev' };
    eventHandlers['join_study_room'](joinPayload);

    expect(mockSocket.join).toHaveBeenCalledWith('room:room_algos_101');
    expect(mockSocket.roomId).toBe('room_algos_101');
    expect(mockSocket.userId).toBe('user_001');

    const toEmitMock = mockSocket.to('room:room_algos_101').emit;
    expect(toEmitMock).toHaveBeenCalledWith('peer_joined', {
      userId: 'user_001',
      username: 'milan_dev',
      socketId: 'socket_12345',
    });
  });

  it('should relay webrtc_signal to target socket targetSocketId', () => {
    videoSyncHandler(mockIo, mockSocket);

    const signalPayload = {
      targetSocketId: 'socket_remote_99',
      signalData: { type: 'offer', sdp: 'dummy_sdp_offer' },
    };

    eventHandlers['webrtc_signal'](signalPayload);

    expect(mockIo.to).toHaveBeenCalledWith('socket_remote_99');
    expect(mockIo.to('socket_remote_99').emit).toHaveBeenCalledWith('webrtc_signal_received', {
      senderSocketId: 'socket_12345',
      signalData: { type: 'offer', sdp: 'dummy_sdp_offer' },
    });
  });

  it('should broadcast editor_change content to room peers', () => {
    videoSyncHandler(mockIo, mockSocket);

    eventHandlers['join_study_room']({ roomId: 'room_js_pro', userId: 'user_777', username: 'dev' });
    eventHandlers['editor_change']({ content: 'function binarySearch() {}' });

    const toEmitMock = mockSocket.to('room:room_js_pro').emit;
    expect(toEmitMock).toHaveBeenCalledWith('editor_update', {
      content: 'function binarySearch() {}',
    });
  });

  it('should relay media_state_change (mute/camera toggles) to room peers', () => {
    videoSyncHandler(mockIo, mockSocket);

    eventHandlers['join_study_room']({ roomId: 'room_js_pro', userId: 'user_777', username: 'dev' });
    eventHandlers['media_state_change']({ audioMuted: true, videoMuted: false });

    const toEmitMock = mockSocket.to('room:room_js_pro').emit;
    expect(toEmitMock).toHaveBeenCalledWith('peer_media_state', {
      userId: 'user_777',
      audioMuted: true,
      videoMuted: false,
    });
  });

  it('should notify room peers on disconnect drop', () => {
    videoSyncHandler(mockIo, mockSocket);

    eventHandlers['join_study_room']({ roomId: 'room_js_pro', userId: 'user_777', username: 'dev' });
    eventHandlers['disconnect']();

    const toEmitMock = mockSocket.to('room:room_js_pro').emit;
    expect(toEmitMock).toHaveBeenCalledWith('peer_left', {
      socketId: 'socket_12345',
      userId: 'user_777',
    });
  });

  it('should register TypeScript video sync handlers identically', () => {
    registerVideoSyncHandlers(mockIo, mockSocket);
    expect(eventHandlers['join_study_room']).toBeDefined();
    expect(eventHandlers['webrtc_signal']).toBeDefined();
    expect(eventHandlers['editor_change']).toBeDefined();
    expect(eventHandlers['media_state_change']).toBeDefined();
    expect(eventHandlers['disconnect']).toBeDefined();
  });
});

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  transportMode: string;
  emitWithFallback: (eventName: string, data: any) => Promise<void>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  transportMode: 'polling',
  emitWithFallback: async () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transportMode, setTransportMode] = useState<string>('polling');
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      const { auth } = await import('../lib/firebase');
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
    } catch {
      // Not authenticated
    }
    return null;
  }, []);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL;
    if (!backendUrl) {
      console.log('[SocketContext] WebSockets inactive — running in pure REST API fallback mode');
      return;
    }

    let socketInstance: Socket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = async () => {
      const token = await getAuthToken();

      socketInstance = io(backendUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 30000,
        timeout: 5000,
        autoConnect: true,
        auth: token ? { token } : undefined,
      });

      socketRef.current = socketInstance;
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        setIsConnected(true);
        setTransportMode(socketInstance!.io.engine.transport.name);
        reconnectAttemptsRef.current = 0;
      });

      socketInstance.on('disconnect', (reason) => {
        setIsConnected(false);
        if (reason === 'io server disconnect' || reason === 'transport close') {
          // Server closed connection, attempt reconnection with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current += 1;
          if (reconnectAttemptsRef.current <= maxReconnectAttempts) {
            reconnectTimer = setTimeout(() => {
              socketInstance?.connect();
            }, delay);
          } else {
            console.warn('[SocketContext] Max reconnection attempts reached');
          }
        }
      });

      socketInstance.on('connect_error', (err) => {
        console.warn('[SocketContext] Connection error:', err.message);
        setIsConnected(false);
      });

      socketInstance.io.engine.on('upgrade', () => {
        setTransportMode(socketInstance!.io.engine.transport.name);
      });
    };

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socketInstance) {
        socketInstance.removeAllListeners();
        socketInstance.disconnect();
      }
      socketRef.current = null;
    };
  }, [getAuthToken]);

  const emitWithFallback = useCallback(async (eventName: string, data: any) => {
    if (isConnected && socketRef.current) {
      socketRef.current.emit(eventName, data);
    } else {
      console.warn(`[SocketContext] Socket disconnected. Falling back to REST for event: ${eventName}`);
      try {
        const token = await getAuthToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers,
          body: JSON.stringify({ eventName, data }),
        });
        if (!response.ok) {
          throw new Error('REST fallback failed');
        }
      } catch (err) {
        console.error('[SocketContext] Fallback failed:', err);
      }
    }
  }, [isConnected, getAuthToken]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, transportMode, emitWithFallback }}>
      {children}
    </SocketContext.Provider>
  );
};

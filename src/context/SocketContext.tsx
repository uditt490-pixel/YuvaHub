import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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

  useEffect(() => {
    // Connect WebSocket only when an explicit backend WS URL is configured (e.g. Render/Railway)
    const backendUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL;
    if (!backendUrl) {
      console.log('[SocketContext] WebSockets inactive — running in pure REST API fallback mode');
      return;
    }

    const socketInstance = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 5000,
      autoConnect: true,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setTransportMode(socketInstance.io.engine.transport.name);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen to transport upgrades (e.g., polling to websocket)
    socketInstance.io.engine.on('upgrade', () => {
      setTransportMode(socketInstance.io.engine.transport.name);
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, []);

  const emitWithFallback = async (eventName: string, data: any) => {
    if (isConnected && socketRef.current) {
      socketRef.current.emit(eventName, data);
    } else {
      console.warn(`[SocketContext] Socket disconnected. Falling back to REST for event: ${eventName}`);
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventName, data }),
        });
        if (!response.ok) {
          throw new Error('REST fallback failed');
        }
      } catch (err) {
        console.error('[SocketContext] Fallback failed:', err);
      }
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, transportMode, emitWithFallback }}>
      {children}
    </SocketContext.Provider>
  );
};

import React, { useEffect, useState } from 'react';
import { Bot, Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';

interface AgentStatusUpdate {
  status: string;
}

interface AgentMonitorProps {
  userId: string;
}

export function AgentMonitor({ userId }: AgentMonitorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Connect to Socket.io namespace or default namespace
    const socket: Socket = io(import.meta.env.VITE_API_URL || '', {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      // The server expects us to join a room, but in our backend, it's typically handled upon authentication.
      // Assuming the backend has a way to join `user_${userId}` or we rely on standard auth.
      // If we need to explicitly join:
      socket.emit('join_room', `user_${userId}`);
    });

    socket.on('agent:status', (data: AgentStatusUpdate) => {
      setStatuses((prev) => [...prev, data.status]);

      if (data.status.toLowerCase().includes('successfully') || data.status.toLowerCase().includes('ready for final review')) {
        setIsComplete(true);
      }
      if (data.status.toLowerCase().includes('error') || data.status.toLowerCase().includes('captcha')) {
        setHasError(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  if (!isOpen && statuses.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full">
      <AnimatePresence>
        {isOpen && statuses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Bot className="w-5 h-5" />
                <h3 className="font-semibold">Application Agent</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-gray-50/50 max-h-60 overflow-y-auto flex flex-col gap-3">
              {statuses.map((status, index) => {
                const isLast = index === statuses.length - 1;
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-3 text-sm ${isLast ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
                  >
                    <div className="mt-0.5">
                      {isLast && !isComplete && !hasError && (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      )}
                      {!isLast && !hasError && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      {isLast && isComplete && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      {hasError && isLast && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p>{status}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isOpen && statuses.length > 0 && (
        <button 
          onClick={() => setIsOpen(true)}
          className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface LiveQueueManagerProps {
  boothId: string;
  companyName: string;
  onClose: () => void;
}

export const LiveQueueManager: React.FC<LiveQueueManagerProps> = ({ boothId, companyName, onClose }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [totalQueue, setTotalQueue] = useState<number>(0);

  useEffect(() => {
    // Connect to the specific namespace
    const newSocket = io('http://localhost:3000/career-fair');
    
    newSocket.on('connect', () => {
      // Mock student data
      const student = { uid: `student_${Math.floor(Math.random() * 1000)}`, name: 'Test User' };
      newSocket.emit('join_queue', { boothId, student });
    });

    newSocket.on('queue_update', (data: { position: number, totalQueue: number }) => {
      setPosition(data.position);
      setTotalQueue(data.totalQueue);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [boothId]);

  const estimatedWait = position ? position * 5 : 0; // Rough estimate: 5 mins per person

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-100">
          <div className="h-full bg-blue-600 animate-pulse" style={{ width: '100%' }}></div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Live Queue</h2>
        <p className="text-gray-600 mb-8">Waiting for a 1-on-1 chat with <span className="font-semibold text-gray-900">{companyName}</span></p>
        
        {position !== null ? (
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mb-8">
            <div className="text-5xl font-extrabold text-blue-600 mb-2">{position}</div>
            <p className="text-blue-800 font-medium">Your position in line</p>
            <div className="mt-4 text-sm text-blue-700 bg-blue-100 py-2 rounded-lg">
              Estimated wait time: <span className="font-bold">~{estimatedWait} mins</span>
            </div>
            <p className="text-xs text-blue-500 mt-3">Total people in queue: {totalQueue}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500 font-medium">Joining the queue...</p>
          </div>
        )}

        <button 
          onClick={onClose}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-lg transition-colors border border-red-200"
        >
          Leave Queue
        </button>
      </div>
    </div>
  );
};

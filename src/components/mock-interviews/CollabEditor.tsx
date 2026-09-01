import React, { useState, useEffect } from 'react';

// Simplified socket mock for the UI component
const createMockSocket = () => {
  return {
    emit: (event: string, data: any) => console.log(`Emit: ${event}`, data),
    on: (event: string, callback: any) => console.log(`On: ${event}`),
    off: (event: string, callback: any) => console.log(`Off: ${event}`)
  };
};

export const CollabEditor: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const [content, setContent] = useState('// Write your code here\n');
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const s = createMockSocket();
    setSocket(s);

    s.emit('joinSession', sessionId);

    s.on('codeUpdate', (data: { content: string }) => {
      setContent(data.content);
    });

    s.on('peerJoined', () => {
      console.log('Peer joined the session');
    });

    return () => {
      s.emit('leaveSession', sessionId);
      s.off('codeUpdate', () => {});
      s.off('peerJoined', () => {});
    };
  }, [sessionId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (socket) {
      socket.emit('codeChange', { sessionId, content: newContent });
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full p-4 gap-4 bg-gray-50">
      <div className="flex justify-between items-center bg-surface p-4 rounded-md shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold">Collaborative Workspace</h2>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-sm font-medium text-gray-700">Peer Connected</span>
        </div>
      </div>
      
      <div className="flex flex-1 gap-4">
        <div className="flex-1 max-w-sm overflow-auto bg-surface rounded-lg shadow-sm border border-gray-200">
          <div className="p-4">
            <h3 className="font-bold mb-2">Problem Description</h3>
            <p className="text-sm text-gray-600">
              Work together with your peer to solve a typical technical interview question. 
              Use the editor on the right to write your code. Your changes will sync in real-time.
            </p>
          </div>
        </div>

        <div className="flex-[2] bg-surface rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-0 h-full">
            <textarea
              className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 outline-none resize-none"
              value={content}
              onChange={handleChange}
              spellCheck="false"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

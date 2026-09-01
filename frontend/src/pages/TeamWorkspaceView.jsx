import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

export default function TeamWorkspaceView({ workspaceId, userId }) {
  const [notepad, setNotepad] = useState('');
  const [checklist, setChecklist] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Instantiate socket namespace bridge connection
    socketRef.current = io('/api/ws/workspace');

    socketRef.current.emit('join-workspace', { workspaceId, userId });

    socketRef.current.on('notepad-updated', ({ text }) => {
      setNotepad(text);
    });

    socketRef.current.on('task-toggled', ({ taskId, completed }) => {
      setChecklist(prev => prev.map(t => t.id === taskId ? { ...t, completed } : t));
    });

    return () => socketRef.current.disconnect();
  }, [workspaceId, userId]);

  const handleNotepadChange = (e) => {
    const text = e.target.value;
    setNotepad(text);
    socketRef.current.emit('edit-notepad', { text });
  };

  const handleTaskToggle = (taskId, currentStatus) => {
    const completed = !currentStatus;
    setChecklist(prev => prev.map(t => t.id === taskId ? { ...t, completed } : t));
    socketRef.current.emit('toggle-task', { taskId, completed });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-w-7xl mx-auto">
      <section className="bg-white p-5 rounded-xl shadow border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Shared Workspace Notepad</h3>
        <textarea
          value={notepad}
          onChange={handleNotepadChange}
          className="w-full h-96 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Brainstorm with your team in real-time here..."
        />
      </section>

      <section className="bg-white p-5 rounded-xl shadow border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Feature Core Checklist</h3>
        <div className="space-y-3">
          {checklist.map(task => (
            <label key={task.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleTaskToggle(task.id, task.completed)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className={`text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {task.task}
              </span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

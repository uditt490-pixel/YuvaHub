import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

interface Props {
  workspaceId: string;
  userId: string;
}

export const TeamWorkspaceView: React.FC<Props> = ({ workspaceId, userId }) => {
  const [notepad, setNotepad] = useState<string>('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'task_1', task: 'Set up repository & environment variables', completed: true },
    { id: 'task_2', task: 'Build core API endpoints and database schema', completed: false },
    { id: 'task_3', task: 'Develop responsive frontend UI components', completed: false },
    { id: 'task_4', task: 'Deploy live demo for hackathon submission', completed: false },
  ]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Instantiate socket namespace bridge connection
    socketRef.current = io('/api/ws/workspace');

    socketRef.current.emit('join-workspace', { workspaceId, userId });

    socketRef.current.on('notepad-updated', ({ text }: { text: string }) => {
      setNotepad(text);
    });

    socketRef.current.on('task-toggled', ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      setChecklist(prev => prev.map(t => t.id === taskId ? { ...t, completed } : t));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [workspaceId, userId]);

  const handleNotepadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNotepad(text);
    socketRef.current?.emit('edit-notepad', { text });
  };

  const handleTaskToggle = (taskId: string, currentStatus: boolean) => {
    const completed = !currentStatus;
    setChecklist(prev => prev.map(t => t.id === taskId ? { ...t, completed } : t));
    socketRef.current?.emit('toggle-task', { taskId, completed });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-w-7xl mx-auto">
      <section className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
        <h3 className="text-lg font-bold text-white mb-4">Shared Workspace Notepad</h3>
        <textarea
          value={notepad}
          onChange={handleNotepadChange}
          className="w-full h-96 p-4 border border-slate-800 rounded-xl bg-slate-950 text-emerald-400 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Brainstorm with your team in real-time here..."
        />
      </section>

      <section className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
        <h3 className="text-lg font-bold text-white mb-4">Feature Core Checklist</h3>
        <div className="space-y-3">
          {checklist.map(task => (
            <label key={task.id} className="flex items-center space-x-3 p-3 hover:bg-slate-850 bg-slate-950/60 border border-slate-800/60 rounded-xl cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleTaskToggle(task.id, task.completed)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-900"
              />
              <span className={`text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {task.task}
              </span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
};

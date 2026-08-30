import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Save, Users, Code, Copy } from 'lucide-react';

interface CollaborativeCodeEditorProps {
    snippetId: string;
    userId: string;
    initialLanguage?: string;
}

/**
 * CollaborativeCodeEditor provides a real-time, syntax-highlighted code editing experience.
 */
export const CollaborativeCodeEditor: React.FC<CollaborativeCodeEditorProps> = ({
    snippetId,
    userId,
    initialLanguage = 'javascript'
}) => {
    const [content, setContent] = useState('// Loading snippet...');
    const [language, setLanguage] = useState(initialLanguage);
    const [activeUsers, setActiveUsers] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        // Initialize Socket.io connection
        socketRef.current = io(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/snippets`);
        const socket = socketRef.current;

        socket.emit('join-snippet', { snippetId, userId });

        socket.on('snippet-state', (data) => {
            setContent(data.content);
            setLanguage(data.language);
            setActiveUsers(data.activeUsers);
        });

        socket.on('content-updated', (data) => {
            if (data.userId !== userId) {
                setContent(data.content);
            }
        });

        socket.on('user-joined', () => setActiveUsers(prev => prev + 1));
        socket.on('user-left', () => setActiveUsers(prev => Math.max(1, prev - 1)));

        return () => {
            socket.disconnect();
        };
    }, [snippetId, userId]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);

        // Debounce socket emission in production; immediate here for simplicity
        socketRef.current?.emit('update-content', { snippetId, content: newContent, userId });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        // Could add a toast notification here
    };

    return (
        <div className="flex flex-col h-[600px] bg-gray-900 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                    <Code className="w-5 h-5 text-blue-400" />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-400 text-sm">
                        <Users className="w-4 h-4 mr-1.5" />
                        <span>{activeUsers} active</span>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                        title="Copy to clipboard"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                        <button className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors">
                            <Save className="w-4 h-4 mr-1.5" />
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 relative">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleContentChange}
                    className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none leading-6"
                    spellCheck={false}
                    placeholder="Start typing your code here..."
                />
                {/* Mock Line Numbers */}
                <div className="absolute top-0 left-0 w-10 h-full bg-gray-800 border-r border-gray-700 text-gray-500 font-mono text-sm text-right pr-2 pt-4 select-none">
                    {content.split('\n').map((_, i) => (
                        <div key={i}>{i + 1}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CollaborativeCodeEditor;

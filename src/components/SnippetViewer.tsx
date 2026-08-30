import React, { useState } from 'react';
import { Code, Clock, User } from 'lucide-react';

interface Snippet {
    _id: string;
    title: string;
    language: string;
    authorId: { name: string };
    createdAt: string;
    activeSessions: string[];
}

interface SnippetViewerProps {
    snippets: Snippet[];
    onSelect: (id: string) => void;
}

/**
 * SnippetViewer displays a list of public community code snippets.
 */
export const SnippetViewer: React.FC<SnippetViewerProps> = ({ snippets, onSelect }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snippets.map((snippet) => (
                <div
                    key={snippet._id}
                    onClick={() => onSelect(snippet._id)}
                    className="p-4 bg-surface dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                            <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-mono rounded">
                            {snippet.language}
                        </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                        {snippet.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                            <User className="w-3.5 h-3.5 mr-1" />
                            <span>{snippet.authorId?.name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {snippet.activeSessions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                ● {snippet.activeSessions.length} users editing now
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SnippetViewer;

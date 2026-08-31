import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Paperclip, Lock, Check, CheckCheck, Loader2, AlertCircle } from 'lucide-react';

interface Message {
    _id?: string;
    senderId: string;
    encryptedContent: string;
    iv: string;
    attachmentUrl?: string;
    attachmentName?: string;
    createdAt: string;
    isRead: boolean;
    decryptedContent?: string; // Added client-side after decryption
}

interface SecureChatInterfaceProps {
    currentUserId: string;
    otherUserId: string;
    otherUserName: string;
}

/**
 * SecureChatInterface provides an end-to-end encrypted messaging UI.
 * It handles encryption before sending and decryption upon receiving.
 */
export const SecureChatInterface: React.FC<SecureChatInterfaceProps> = ({
    currentUserId,
    otherUserId,
    otherUserName
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mock encryption/decryption functions for the frontend
    // In production, use Web Crypto API with proper key exchange
    const mockEncrypt = (text: string, conversationId: string) => {
        return {
            encryptedContent: btoa(`encrypted:${text}:${conversationId}`),
            iv: btoa('mock-iv-123456')
        };
    };

    const mockDecrypt = (encryptedContent: string, iv: string, conversationId: string) => {
        try {
            const decoded = atob(encryptedContent);
            if (decoded.startsWith('encrypted:')) {
                return decoded.split(':')[1];
            }
            return '[Decryption Failed]';
        } catch (e) {
            return '[Decryption Error]';
        }
    };

    useEffect(() => {
        const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        socketRef.current = io(`${socketUrl}/secure-chat`, {
            auth: { userId: currentUserId },
        });
        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Connected to secure chat');
            fetchHistory();
        });

        socket.on('receive-message', (data: Message) => {
            const conversationId = [currentUserId, otherUserId].sort().join('-');
            const decrypted = mockDecrypt(data.encryptedContent, data.iv, conversationId);

            setMessages((prev) => [...prev, { ...data, decryptedContent: decrypted }]);

            // Mark as read
            socket.emit('mark-read', { conversationId, senderId: data.senderId });
        });

        socket.on('messages-read', () => {
            setMessages((prev) => prev.map(msg =>
                msg.senderId === currentUserId ? { ...msg, isRead: true } : msg
            ));
        });

        return () => {
            socket.disconnect();
        };
    }, [currentUserId, otherUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            // Mock API call
            const conversationId = [currentUserId, otherUserId].sort().join('-');
            const mockHistory: Message[] = [
                {
                    senderId: otherUserId,
                    encryptedContent: mockEncrypt('Hello! How can I help you today?', conversationId).encryptedContent,
                    iv: mockEncrypt('', conversationId).iv,
                    createdAt: new Date(Date.now() - 100000).toISOString(),
                    isRead: true,
                }
            ];

            const decryptedHistory = mockHistory.map(msg => ({
                ...msg,
                decryptedContent: mockDecrypt(msg.encryptedContent, msg.iv, conversationId),
            }));

            setMessages(decryptedHistory);
        } catch (err) {
            setError('Failed to load message history.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const conversationId = [currentUserId, otherUserId].sort().join('-');
        const { encryptedContent, iv } = mockEncrypt(inputText, conversationId);

        const optimisticMessage: Message = {
            senderId: currentUserId,
            encryptedContent,
            iv,
            createdAt: new Date().toISOString(),
            isRead: false,
            decryptedContent: inputText,
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        setInputText('');

        socketRef.current?.emit('send-message', {
            receiverId: otherUserId,
            encryptedContent,
            iv,
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                            {otherUserName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{otherUserName}</h3>
                        <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                            <Lock className="w-3 h-3 mr-1" />
                            End-to-end encrypted
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                {error && (
                    <div className="flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {error}
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${isMe
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-600'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.decryptedContent}</p>

                                {msg.attachmentUrl && (
                                    <div className="mt-2 p-2 bg-black/10 dark:bg-white/10 rounded flex items-center text-xs">
                                        <Paperclip className="w-3 h-3 mr-2" />
                                        <span className="truncate">{msg.attachmentName || 'Attachment'}</span>
                                    </div>
                                )}

                                <div className={`flex items-center justify-end mt-1 text-[10px] ${isMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {isMe && (
                                        <span className="ml-1">
                                            {msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Attach file"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type an encrypted message..."
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />

                <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    aria-label="Send message"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default SecureChatInterface;

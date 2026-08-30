import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MessageSquare, Clock, Check, CheckCheck } from 'lucide-react';
import { fetchConversations, fetchMessages, sendDirectMessage, markConversationRead } from '../../services/apiClient';
import { useAppContext } from '../../context/AppContext';
import { useSocket } from '../../context/SocketContext';

export default function DirectMessages() {
  const { user } = useAppContext();
  const { socket, isConnected } = useSocket();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(getRecipientId(activeConversation));
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (socket && isConnected && user?.uid) {
      socket.emit('joinDmRoom', user.uid);

      socket.on('dm:newMessage', (message: any) => {
        // If message belongs to active thread
        if (activeConversation && getRecipientId(activeConversation) === message.senderId) {
          setMessages(prev => [...prev, message]);
          markConversationRead(message.senderId).then(() => {
            loadConversations(); // Update unread counts
          });
        } else {
          // Message for another thread, just update conversations list to show unread
          loadConversations();
        }
      });

      return () => {
        socket.emit('leaveDmRoom', user.uid);
        socket.off('dm:newMessage');
      };
    }
  }, [socket, isConnected, user, activeConversation]);

  const loadConversations = async () => {
    try {
      const data = await fetchConversations(1, 20);
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Failed to load conversations", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (recipientId: string) => {
    setLoadingMessages(true);
    try {
      const data = await fetchMessages(recipientId, 1, 50);
      setMessages(data.messages || []);
      
      // Update local unread count if needed
      setConversations(prev => prev.map(conv => {
        if (getRecipientId(conv) === recipientId) {
          return { ...conv, unreadCounts: { ...conv.unreadCounts, [user?.uid || '']: 0 } };
        }
        return conv;
      }));
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;

    const content = messageInput.trim();
    setMessageInput('');
    const recipientId = getRecipientId(activeConversation);

    // Optimistic UI update
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      senderId: user?.uid,
      recipientId,
      content,
      createdAt: new Date().toISOString(),
      readAt: null
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      await sendDirectMessage(recipientId, content);
      loadConversations(); // Update last message in sidebar
    } catch (error) {
      console.error("Failed to send message", error);
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
      alert("Failed to send message.");
    }
  };

  const getRecipientId = (conversation: any) => {
    if (!user) return '';
    return conversation.participants.find((p: string) => p !== user.uid) || conversation.participants[0];
  };

  const filteredConversations = conversations.filter(conv => {
    // Basic search - in a real app, we'd resolve participant IDs to names
    const recipientId = getRecipientId(conv);
    return recipientId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-surface dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-900/50">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
          {loadingConversations ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading conversations...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No conversations found.</div>
          ) : (
            filteredConversations.map((conv) => {
              const recipientId = getRecipientId(conv);
              const unreadCount = conv.unreadCounts?.[user?.uid || ''] || 0;
              const isActive = activeConversation?._id === conv._id;
              
              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-colors ${
                    isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                      {recipientId.substring(0, 2).toUpperCase()}
                    </div>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">
                        User {recipientId.substring(0, 6)}
                      </h4>
                      {conv.lastMessage?.createdAt && (
                        <span className="text-[10px] text-gray-500 whitespace-nowrap shrink-0">
                          {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                      {conv.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface dark:bg-gray-800">
        {activeConversation ? (
          <>
            <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 shrink-0 bg-surface dark:bg-gray-800">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0 mr-3">
                {getRecipientId(activeConversation).substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                  User {getRecipientId(activeConversation).substring(0, 6)}
                </h3>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center py-4">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
                  <MessageSquare className="w-12 h-12 opacity-20" />
                  <p>No messages yet. Send a message to start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-br-sm' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'} text-[10px]`}>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && (
                            msg.readAt ? <CheckCheck className="w-3 h-3 text-blue-300" /> : <Check className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-medium">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

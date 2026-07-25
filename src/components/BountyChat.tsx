import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAppContext } from '../context/AppContext';
import { auth } from '../lib/firebase';

const MAX_MESSAGE_LENGTH = 1000;
const TOXICITY_API_URL = '/api/v1/moderate';

interface BountyChatProps {
  bountyId: string;
  posterId: string;
  mentorId: string;
  onClose: () => void;
  onResolved: () => void;
}

function sanitizeMessage(text: string): string {
  const el = document.createElement('div');
  el.textContent = text;
  return el.textContent || '';
}

async function checkToxicity(text: string): Promise<boolean> {
  try {
    const res = await fetch(TOXICITY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.isToxic === true;
    }
  } catch {
    // Toxicity check unavailable, allow message
  }
  return false;
}

export default function BountyChat({ bountyId, posterId, mentorId, onClose, onResolved }: BountyChatProps) {
  const { socket, isConnected } = useSocket();
  const { profile } = useAppContext();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPoster = profile?.uid === posterId;

  useEffect(() => {
    if (socket && isConnected) {
      socket.emit("join_bounty_room", { bountyId });
      
      const messageHandler = (data: any) => {
        if (data.bountyId === bountyId) {
          setMessages(prev => [...prev, data]);
        }
      };
      
      socket.on("receive_bounty_message", messageHandler);
      
      return () => {
        socket.off("receive_bounty_message", messageHandler);
      };
    }
  }, [socket, isConnected, bountyId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !socket || !profile || sending) return;
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setError(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
      return;
    }

    setSending(true);
    setError(null);

    const isToxic = await checkToxicity(trimmed);
    if (isToxic) {
      setError('Message contains inappropriate content and cannot be sent.');
      setSending(false);
      return;
    }

    const safeMessage = sanitizeMessage(trimmed);
    const msg = {
      bountyId,
      message: safeMessage,
      senderId: profile.uid,
      senderName: profile.name,
      timestamp: Date.now()
    };
    
    socket.emit("bounty_chat_message", msg);
    setMessages(prev => [...prev, msg]);
    setInputText("");
    setSending(false);
  }, [inputText, socket, profile, sending, bountyId]);

  const handleResolve = async () => {
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`/api/v1/bounties/${bountyId}/resolve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setShowRating(true);
    } catch (e) {
      console.error(e);
    }
  };

  const submitRating = async () => {
    if (!auth.currentUser || rating === 0) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch(`/api/v1/bounties/${bountyId}/rate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating })
      });
      onResolved();
    } catch (e) {
      console.error(e);
    }
  };

  if (showRating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Rate Your Mentor</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">How helpful was the mentorship for this bounty?</p>
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map(star => (
              <button 
                key={star} 
                onClick={() => setRating(star)}
                className={`text-3xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
              >
                ★
              </button>
            ))}
          </div>
          <button 
            onClick={submitRating}
            disabled={rating === 0}
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg disabled:opacity-50"
          >
            Submit Rating
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900 sm:p-4 md:p-12 lg:p-24">
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Mentorship Chat</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ephemeral room • Messages are not stored permanently</p>
          </div>
          <div className="flex gap-3">
            {isPoster && (
              <button onClick={handleResolve} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Mark Resolved
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Close
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-gray-900/50">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm mt-10">
              Start the conversation! What do you need help with?
            </div>
          )}
          {messages.map((m, i) => {
            const isMe = m.senderId === profile?.uid;
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'}`}>
                  {!isMe && <div className="text-xs opacity-75 mb-1">{m.senderName}</div>}
                  <div className="text-sm">{m.message}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          {error && (
            <div className="text-red-500 text-xs mb-2 px-2">{error}</div>
          )}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={inputText}
                onChange={e => {
                  if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                    setInputText(e.target.value);
                    setError(null);
                  }
                }}
                onKeyDown={e => e.key === 'Enter' && !sending && sendMessage()}
                placeholder="Type a message..."
                maxLength={MAX_MESSAGE_LENGTH}
                className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-full px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {inputText.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
            <button 
              onClick={sendMessage} 
              disabled={sending || !inputText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 w-10 h-10 flex justify-center items-center disabled:opacity-50"
            >
              {sending ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, ThumbsUp, CheckCircle2, Clock, X, Send, Reply, AlertCircle } from 'lucide-react';
import { ForumThread } from '../../services/discussionForumEngine';
import { getForumReplies, createForumReply, upvoteForumReply, acceptForumAnswer } from '../../services/apiClient';
import { io, Socket } from 'socket.io-client';
import { auth } from '../../lib/firebase';

interface ForumReplyThreadProps {
    thread: ForumThread;
    onClose: () => void;
}

interface ReplyItem {
    _id: string;
    postId: string;
    parentReplyId: string | null;
    authorName: string;
    authorUid: string;
    content: string;
    upvotes: number;
    upvotedBy: string[];
    isAcceptedAnswer: boolean;
    createdAt: string;
}

export const ForumReplyThread: React.FC<ForumReplyThreadProps> = ({ thread, onClose }) => {
    const [replies, setReplies] = useState<ReplyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [replyingTo, setReplyingTo] = useState<ReplyItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const currentUser = auth.currentUser;

    useEffect(() => {
        let mounted = true;
        const fetchReplies = async () => {
            setLoading(true);
            try {
                const res = await getForumReplies(thread.id);
                if (mounted) {
                    setReplies(res.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch replies:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchReplies();

        // Setup Socket.IO
        const token = localStorage.getItem('token') || ''; // Assuming token is used if needed
        const newSocket = io({
            auth: { token }
        });
        
        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            newSocket.emit('joinForumPostRoom', thread.id);
        });

        newSocket.on('forum:newReply', (newReply: ReplyItem) => {
            if (mounted) {
                setReplies(prev => [...prev, newReply]);
            }
        });

        newSocket.on('forum:replyUpvoted', ({ replyId, upvotes }: { replyId: string, upvotes: number }) => {
            if (mounted) {
                setReplies(prev => prev.map(r => r._id === replyId ? { ...r, upvotes } : r));
            }
        });

        newSocket.on('forum:answerAccepted', ({ replyId }: { replyId: string }) => {
            if (mounted) {
                setReplies(prev => prev.map(r => ({
                    ...r,
                    isAcceptedAnswer: r._id === replyId
                })));
            }
        });

        return () => {
            mounted = false;
            if (socketRef.current) {
                socketRef.current.emit('leaveForumPostRoom', thread.id);
                socketRef.current.disconnect();
            }
        };
    }, [thread.id]);

    const handleSubmitReply = async () => {
        if (!replyContent.trim()) return;
        
        setIsSubmitting(true);
        try {
            await createForumReply(thread.id, replyContent, replyingTo?._id);
            setReplyContent('');
            setReplyingTo(null);
        } catch (err) {
            console.error("Failed to submit reply", err);
            alert("Failed to submit reply");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpvote = async (replyId: string) => {
        if (!currentUser) return alert("Please log in to upvote");
        try {
            // Optimistic update handled by socket or we can do it here
            await upvoteForumReply(thread.id, replyId);
        } catch (err) {
            console.error("Failed to upvote", err);
        }
    };

    const handleAcceptAnswer = async (replyId: string) => {
        if (!currentUser) return;
        try {
            await acceptForumAnswer(thread.id, replyId);
        } catch (err) {
            console.error("Failed to accept answer", err);
            alert("Failed to accept answer. Are you the author?");
        }
    };

    // Organize replies into threads (1-level deep)
    const topLevelReplies = replies.filter(r => !r.parentReplyId);
    
    // Sort top level: Accepted first, then by upvotes, then by date
    topLevelReplies.sort((a, b) => {
        if (a.isAcceptedAnswer) return -1;
        if (b.isAcceptedAnswer) return 1;
        if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const getChildren = (parentId: string) => {
        return replies
            .filter(r => r.parentReplyId === parentId)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    };

    const renderReply = (reply: ReplyItem, isChild = false) => {
        const isAuthor = currentUser && thread.authorName === currentUser.displayName; // simplistic check, ideally use uid

        return (
            <div key={reply._id} className={`flex flex-col gap-3 ${isChild ? 'ml-8 mt-3 border-l-2 border-slate-800 pl-4' : 'mt-6'}`}>
                <div className={`bg-slate-900/60 rounded-2xl p-4 border ${reply.isAcceptedAnswer ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-slate-800'}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm">
                                {reply.authorName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                    {reply.authorName}
                                    {reply.isAcceptedAnswer && (
                                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                                            <CheckCircle2 className="w-3 h-3" /> Accepted Answer
                                        </span>
                                    )}
                                </div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(reply.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {reply.content}
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        <button 
                            onClick={() => handleUpvote(reply._id)}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 transition-colors"
                        >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {reply.upvotes}
                        </button>
                        
                        {!isChild && (
                            <button 
                                onClick={() => {
                                    setReplyingTo(reply);
                                    document.getElementById('reply-input')?.focus();
                                }}
                                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                            >
                                <Reply className="w-3.5 h-3.5" /> Reply
                            </button>
                        )}

                        {!isChild && isAuthor && !reply.isAcceptedAnswer && (
                            <button 
                                onClick={() => handleAcceptAnswer(reply._id)}
                                className="ml-auto text-xs font-bold text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Answer
                            </button>
                        )}
                    </div>
                </div>

                {/* Render children */}
                {!isChild && getChildren(reply._id).map(child => renderReply(child, true))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-center items-start pt-10 pb-10 overflow-hidden">
            <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-start shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase">
                                {thread.category}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-100">{thread.title}</h2>
                        <div className="mt-2 text-sm text-slate-400 whitespace-pre-wrap">{thread.bodySummary}</div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-800/50 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Replies Area */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : replies.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No replies yet. Be the first to answer!</p>
                        </div>
                    ) : (
                        <div className="pb-10">
                            {topLevelReplies.map(reply => renderReply(reply))}
                        </div>
                    )}
                </div>

                {/* Composer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/80 shrink-0">
                    {replyingTo && (
                        <div className="flex items-center justify-between bg-slate-800/50 px-3 py-2 rounded-lg mb-2 text-xs">
                            <span className="text-slate-300">
                                Replying to <strong className="text-indigo-400">{replyingTo.authorName}</strong>
                            </span>
                            <button onClick={() => setReplyingTo(null)} className="text-slate-500 hover:text-slate-300">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                    
                    {!currentUser ? (
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            Please log in to participate in the discussion.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 relative">
                            <textarea
                                id="reply-input"
                                value={replyContent}
                                onChange={e => setReplyContent(e.target.value)}
                                placeholder="Type your answer... (Markdown supported soon)"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 min-h-[100px] resize-none"
                            />
                            <button 
                                onClick={handleSubmitReply}
                                disabled={isSubmitting || !replyContent.trim()}
                                className="absolute bottom-3 right-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                            >
                                {isSubmitting ? 'Posting...' : <><Send className="w-3.5 h-3.5" /> Post Reply</>}
                            </button>
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
};

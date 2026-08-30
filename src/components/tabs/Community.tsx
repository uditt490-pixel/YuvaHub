import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Megaphone, HelpCircle, Link as LinkIcon, Send, Heart, 
  MessageSquare, Loader2, Sparkles, Trash2, ChevronDown, ChevronUp, 
  AlertTriangle, Flame, Clock, Tag, UserCheck, Shield, BarChart2, Flag
} from 'lucide-react';
import { UserProfile } from '../../types';
import { EmptyState, ErrorState, SkeletonCard } from '../ui/states';
import { useAppContext } from '../../context/AppContext';
import { ReportModal } from '../ui/ReportModal';

interface PostComment {
  _id?: string;
  id?: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
}

interface Post {
  _id?: string;
  id?: string;
  title?: string;
  content: string;
  author: string;
  authorUid?: string;
  type: 'Win' | 'Update' | 'Question' | 'Resource' | string;
  tags?: string[];
  upvotes: number;
  upvoted_by?: string[];
  repliesCount?: number;
  createdAt: string;
}

export default function Community() {
  const { user, profile, setActiveTab } = useAppContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortOption, setSortOption] = useState<'hot' | 'latest' | 'top' | 'trending'>('hot');

  // Optimistic Upvote & Downvote handler
  const handleVote = async (targetId: string, targetType: 'post' | 'comment' = 'post', voteType: 'upvote' | 'downvote') => {
    const userId = user?.uid || user?.id || 'user_anon';

    if (targetType === 'post') {
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          const currentId = p.id || p._id;
          if (currentId === targetId) {
            const upvotesArr = Array.isArray(p.upvoted_by) ? p.upvoted_by : [];
            const downvotesArr = Array.isArray((p as any).downvoted_by) ? (p as any).downvoted_by : [];

            const hasUpvoted = upvotesArr.includes(userId);
            const hasDownvoted = downvotesArr.includes(userId);

            let newUpvotes = [...upvotesArr];
            let newDownvotes = [...downvotesArr];

            if (voteType === 'upvote') {
              if (hasUpvoted) {
                newUpvotes = newUpvotes.filter((id) => id !== userId);
              } else {
                if (!newUpvotes.includes(userId)) newUpvotes.push(userId);
                newDownvotes = newDownvotes.filter((id) => id !== userId);
              }
            } else if (voteType === 'downvote') {
              if (hasDownvoted) {
                newDownvotes = newDownvotes.filter((id) => id !== userId);
              } else {
                if (!newDownvotes.includes(userId)) newDownvotes.push(userId);
                newUpvotes = newUpvotes.filter((id) => id !== userId);
              }
            }

            const numericUp = typeof p.upvotes === 'number' ? p.upvotes : 0;
            const diff = newUpvotes.length - upvotesArr.length;

            return {
              ...p,
              upvotes: Math.max(0, numericUp + diff),
              upvoted_by: newUpvotes,
              downvoted_by: newDownvotes,
            } as any;
          }
          return p;
        })
      );
    }

    try {
      const res = await fetch('/api/v1/community/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, targetType, voteType }),
      });
      if (!res.ok) {
        void fetchPosts(sortOption);
      }
    } catch (err) {
      console.error('Error dispatching vote:', err);
      void fetchPosts(sortOption);
    }
  };

  const handleUpvote = (postId: string) => handleVote(postId, 'post', 'upvote');
  const handleDownvote = (postId: string) => handleVote(postId, 'post', 'downvote');

  // Post Creator State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('Win');
  const [postTags, setPostTags] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const feedRequestId = useRef(0);

  // General Feed State
  const [initialLoading, setInitialLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);

  // Comments State
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});
  const [loadingCommentsPostId, setLoadingCommentsPostId] = useState<string | null>(null);
  const [commentErrorMap, setCommentErrorMap] = useState<Record<string, string | null>>({});

  // Report State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState<string>('');
  const [reportPostTitle, setReportPostTitle] = useState<string>('');

  const containsProfanity = (text: string): boolean => {
    const profanityRegex = /\b(badword|abuse|hate|spam|scam|idiot|stupid|bastard)\b/i;
    return profanityRegex.test(text);
  };

  const fetchPosts = async (sort = sortOption) => {
    setFeedError(null);
    try {
      const res = await fetch(`/api/v1/posts?sort=${sort}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const postList = Array.isArray(data) ? data : (data.items ?? data.data ?? []);
      if (postList.length > 0) {
        setPosts(postList);
      }
    } catch (err) {
      console.error('Error fetching community posts:', err);
      setFeedError('Unable to fetch live community posts. Showing fallback feed.');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    void fetchPosts(sortOption);
  }, [sortOption]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim() || !user || posting) return;

    if (containsProfanity(postTitle) || containsProfanity(postContent)) {
      setPostError('Post contains inappropriate language.');
      return;
    }

    setPosting(true);
    setPostError(null);

    const authorName = profile?.name || user.displayName || user.email?.split('@')[0] || 'Student Peer';
    const tagArray = postTags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle.trim(),
          content: postContent.trim(),
          type: postType,
          tags: tagArray,
          author: authorName,
          authorUid: user.uid
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create post');

      setPosts(prev => [data.post || data, ...prev]);
      setPostTitle('');
      setPostContent('');
      setPostTags('');
    } catch (err: any) {
      setPostError(err.message || 'Error publishing post');
    } finally {
      setPosting(false);
    }
  };

  const toggleComments = async (postId: string) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      return;
    }

    setActiveCommentPostId(postId);

    const hasCache = !!commentsMap[postId];
    if (!hasCache) {
      setLoadingCommentsPostId(postId);
    }

    try {
      const res = await fetch(`/api/v1/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        const comments = Array.isArray(data) ? data : (data.comments ?? []);
        setCommentsMap(prev => ({ ...prev, [postId]: comments }));
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      if (!hasCache) {
        setLoadingCommentsPostId(null);
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputMap[postId] || '';
    if (!text.trim() || !user) return;

    if (containsProfanity(text)) {
      setCommentErrorMap(prev => ({ ...prev, [postId]: 'Comment contains inappropriate language.' }));
      return;
    }

    setCommentErrorMap(prev => ({ ...prev, [postId]: null }));
    const authorName = profile?.name || user.displayName || 'Anonymous Student';

    const optimisticComment: PostComment = {
      _id: 'c_' + Date.now(),
      postId,
      author: authorName,
      content: text,
      createdAt: new Date().toISOString()
    };

    setCommentsMap(prev => ({
      ...prev,
      [postId]: [optimisticComment, ...(prev[postId] || [])]
    }));
    setCommentInputMap(prev => ({ ...prev, [postId]: '' }));

    setPosts(prev =>
      prev.map(p => ((p.id || p._id) === postId ? { ...p, repliesCount: (p.repliesCount || 0) + 1 } : p))
    );

    try {
      await fetch(`/api/v1/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          author: authorName
        })
      });
    } catch (err) {
      console.error('Error creating comment:', err);
    }
  };

  if (!user) {
    return (
      <div className="w-full max-w-[1400px] mx-auto py-16 flex flex-col items-center justify-center p-10 text-center bg-surface dark:bg-slate-900 rounded-3xl border border-border-theme dark:border-slate-800 space-y-4">
        <MessageSquare className="w-12 h-12 text-primary-blue" />
        <h2 className="text-2xl font-serif font-bold text-text-primary dark:text-white">Community Access Restricted</h2>
        <p className="text-xs text-text-secondary dark:text-slate-400 max-w-sm font-medium">Please sign in to participate in student discussions, upvote wins, and share learning roadmaps.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface dark:bg-slate-900 p-6 rounded-3xl border border-border-theme dark:border-slate-800 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#603620] text-[#f3e4bd] text-xs font-bold uppercase tracking-wider mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-[#f3e4bd]" />
            <span>Student Discussion Network</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-text-primary dark:text-white tracking-tight">
            Community <span className="text-primary-blue italic">Forum</span>
          </h1>
          <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">
            Connect with ambitious peers, ask technical questions, share hackathon wins, and exchange study roadmaps.
          </p>
        </div>

        {/* Sorting Tabs */}
        <div className="flex items-center gap-1.5 bg-background dark:bg-slate-800 p-1.5 rounded-2xl border border-border-theme dark:border-slate-700 text-xs shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('poll_studio')}
            className="px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer text-text-secondary dark:text-slate-300 hover:bg-surface-secondary"
          >
            <BarChart2 className="w-3.5 h-3.5" /> Polls
          </button>
          <button
            onClick={() => setSortOption('latest')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              sortOption === 'latest' ? 'bg-primary-blue text-white shadow-2xs' : 'text-text-secondary dark:text-slate-300 hover:bg-surface-secondary'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Latest
          </button>
          <button
            onClick={() => setSortOption('trending')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              sortOption === 'trending' ? 'bg-primary-blue text-white shadow-2xs' : 'text-text-secondary dark:text-slate-300 hover:bg-surface-secondary'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Trending
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Feed Column */}
        <div className="flex-1 space-y-6">
          {/* Post Creator Box */}
          <form onSubmit={handleCreatePost} className="bg-surface dark:bg-slate-900 p-6 rounded-3xl border border-border-theme dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-2xl bg-[#603620] text-[#f3e4bd] flex items-center justify-center font-serif font-bold text-base shrink-0 shadow-2xs">
                {profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Post Title (e.g. Secured GSoC 2026! or How to prep for Amazon OA?)"
                  className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-text-primary dark:text-white outline-none font-bold"
                />
                <textarea
                  rows={3}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share details, code snippets, or advice..."
                  className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none font-medium resize-none"
                />
              </div>
            </div>

            {postError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                {postError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-border-theme dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                {['Win', 'Update', 'Question', 'Resource'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPostType(t)}
                    className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                      postType === t ? 'bg-[#231f20] text-white border-[#231f20]' : 'bg-background text-text-secondary border-border-theme hover:bg-surface-secondary'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={posting || !postTitle.trim() || !postContent.trim()}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Publish Post</>}
              </button>
            </div>
          </form>

          {/* Posts List Feed */}
          {initialLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState title="No community posts yet" description="Be the first student to publish a post!" />
          ) : (
            posts.map(p => {
              const pid = p.id || p._id || 'post_' + Math.random();
              const isUpvoted = p.upvoted_by?.includes(user.uid);
              const comments = commentsMap[pid] || [];
              const isCommentsOpen = activeCommentPostId === pid;

              return (
                <div key={pid} className="bg-surface dark:bg-slate-900 p-6 rounded-3xl border border-border-theme dark:border-slate-800 shadow-2xs space-y-4 hover:border-primary-blue transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#603620] text-[#f3e4bd] flex items-center justify-center font-serif font-bold text-xs">
                        {p.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-text-primary dark:text-white">{p.author}</h4>
                        <span className="text-[10px] text-text-muted font-medium">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-[#603620] text-[#f3e4bd] text-[10px] font-extrabold rounded-lg uppercase">
                      {p.type}
                    </span>
                  </div>

                  {p.title && <h3 className="text-base font-serif font-bold text-text-primary dark:text-white">{p.title}</h3>}
                  <p className="text-xs text-text-secondary dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line">{p.content}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-border-theme dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleUpvote(pid)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition-colors cursor-pointer ${
                          isUpvoted 
                            ? 'bg-primary-blue text-white border-primary-blue' 
                            : 'bg-background text-text-secondary border-border-theme hover:bg-surface-secondary'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-current' : ''}`} />
                        <span>{p.upvotes || 0} Upvotes</span>
                      </button>

                      <button
                        onClick={() => toggleComments(pid)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-background text-text-secondary border border-border-theme hover:bg-surface-secondary transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{p.repliesCount || comments.length || 0} Replies</span>
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setReportPostId(pid);
                        setReportPostTitle(p.title || 'Community Post');
                        setShowReportModal(true);
                      }}
                      title="Report this post"
                      className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Comments Thread Drawer */}
                  {isCommentsOpen && (
                    <div className="pt-4 border-t border-border-theme space-y-3 animate-fade-in text-xs">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a peer response..."
                          value={commentInputMap[pid] || ''}
                          onChange={e => setCommentInputMap({ ...commentInputMap, [pid]: e.target.value })}
                          className="flex-1 bg-background border border-border-theme rounded-xl px-3 py-2 text-xs text-text-primary outline-none"
                        />
                        <button
                          onClick={() => handleAddComment(pid)}
                          className="px-4 py-2 bg-primary-blue hover:bg-[#96552a] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> Reply
                        </button>
                      </div>

                      {commentErrorMap[pid] && (
                        <p className="text-xs text-red-600 font-semibold">{commentErrorMap[pid]}</p>
                      )}

                      <div className="space-y-2 pt-2">
                        {comments.map((c, i) => (
                          <div key={c._id || i} className="p-3 rounded-xl bg-background border border-border-theme">
                            <span className="font-bold text-text-primary">{c.author}</span>
                            <p className="text-xs text-text-secondary mt-0.5 font-medium">{c.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="post"
        contentId={reportPostId}
        contentTitle={reportPostTitle}
      />
    </div>
  );
}

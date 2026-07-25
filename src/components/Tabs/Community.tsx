import React, { useState, useEffect } from 'react';
import { 
  Trophy, Megaphone, HelpCircle, Link as LinkIcon, Send, Heart, 
  MessageSquare, Loader2, Sparkles, Trash2, ChevronDown, ChevronUp, 
  AlertTriangle, Flame, Clock, Tag, UserCheck
} from 'lucide-react';
import { UserProfile } from '../../types';
import { EmptyState, ErrorState, SkeletonCard } from '../ui/states';
import { useAppContext } from '../../context/AppContext';

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
  const { user, profile } = useAppContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortOption, setSortOption] = useState<'latest' | 'trending'>('latest');

  // Post Creator State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('Win');
  const [postTags, setPostTags] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // General Feed State
  const [initialLoading, setInitialLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);

  // Comments State (map postId -> list of comments)
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});
  const [loadingCommentsPostId, setLoadingCommentsPostId] = useState<string | null>(null);
  const [commentErrorMap, setCommentErrorMap] = useState<Record<string, string | null>>({});

  // Profanity screening helper
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
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (err) {
      console.error('Error fetching community posts:', err);
      setFeedError('Unable to fetch live community posts. Showing fallback feed.');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(sortOption);
  }, [sortOption]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || !user || posting) return;

    if (containsProfanity(postTitle) || containsProfanity(postContent)) {
      setPostError('Post contains inappropriate language or prohibited keywords.');
      return;
    }

    setPosting(true);
    setPostError(null);

    const tagsArray = postTags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    try {
      const res = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle || 'Community Discussion',
          content: postContent,
          author: profile?.name || user.displayName || 'Anonymous Operative',
          uid: user.uid,
          type: postType,
          tags: tagsArray.length > 0 ? tagsArray : ['General']
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create post');
      }

      const newPost = await res.json();
      setPosts(prev => [newPost, ...prev]);
      setPostTitle('');
      setPostContent('');
      setPostTags('');
    } catch (err: any) {
      setPostError(err.message || 'Unable to publish post.');
    } finally {
      setPosting(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    if (!user) return;

    // Optimistic UI Update
    setPosts(prev =>
      prev.map(p => {
        const id = p.id || p._id;
        if (id === postId) {
          const hasUpvoted = p.upvoted_by?.includes(user.uid);
          if (hasUpvoted) return p;
          return {
            ...p,
            upvotes: (p.upvotes || 0) + 1,
            upvoted_by: [...(p.upvoted_by || []), user.uid]
          };
        }
        return p;
      })
    );

    try {
      await fetch(`/api/v1/posts/${postId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
    } catch (err) {
      console.error('Error upvoting post:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setPosts(prev => prev.filter(p => (p.id || p._id) !== postId));
    try {
      await fetch(`/api/v1/posts/${postId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const toggleCommentsView = async (postId: string) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      return;
    }

    setActiveCommentPostId(postId);

    if (!commentsMap[postId]) {
      setLoadingCommentsPostId(postId);
      try {
        const res = await fetch(`/api/v1/posts/${postId}/comments`);
        if (res.ok) {
          const comments = await res.json();
          setCommentsMap(prev => ({ ...prev, [postId]: Array.isArray(comments) ? comments : [] }));
        }
      } catch (err) {
        console.error('Error loading comments:', err);
      } finally {
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

    // Increment reply count on post
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

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Win': return 'border-l-4 border-l-amber-500';
      case 'Update': return 'border-l-4 border-l-blue-600';
      case 'Question': return 'border-l-4 border-l-purple-600';
      case 'Resource': return 'border-l-4 border-l-emerald-600';
      default: return 'border-l-4 border-l-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Win': return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'Update': return <Megaphone className="w-4 h-4 text-blue-600" />;
      case 'Question': return <HelpCircle className="w-4 h-4 text-purple-600" />;
      case 'Resource': return <LinkIcon className="w-4 h-4 text-emerald-600" />;
      default: return null;
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-gray-200 shadow-sm max-w-lg mx-auto my-12 space-y-4">
        <MessageSquare className="w-16 h-16 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-900">Community Access Restricted</h2>
        <p className="text-gray-500 text-sm">Please sign in to participate in student discussions, upvote wins, and share learning resources.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Community Discussion Forum</h2>
              <p className="text-xs text-gray-500 font-medium">Connect with ambitious peers, ask questions, share hackathon wins, and exchange study roadmaps.</p>
            </div>
          </div>
        </div>

        {/* Sorting Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => setSortOption('latest')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              sortOption === 'latest' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-600" /> Latest
          </button>
          <button
            onClick={() => setSortOption('trending')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              sortOption === 'trending' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Trending
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Feed Column */}
        <div className="flex-1 space-y-6">
          {/* Post Creator Box */}
          <form onSubmit={handleCreatePost} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                {profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Post Title (e.g. Secured GSoC 2026! or How to prep for Amazon OA?)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                />
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share details, questions, or resources with the student network..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[90px] resize-none"
                  required
                ></textarea>
                <input
                  type="text"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  placeholder="Tags (comma-separated, e.g. GSoC, DSA, Internship)"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {postError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                {postError}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <div className="flex flex-wrap gap-1.5">
                {['Win', 'Update', 'Question', 'Resource'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPostType(t)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all border ${
                      postType === t
                        ? 'bg-gray-900 text-white border-gray-900 shadow-2xs'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={posting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 text-xs transition-all disabled:opacity-50"
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {posting ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </form>

          {/* Posts List */}
          <div className="space-y-4">
            {initialLoading && <SkeletonCard count={3} />}

            {!initialLoading && feedError && <ErrorState title="Notice" description={feedError} />}

            {!initialLoading && posts.map((post) => {
              const postId = (post.id || post._id) as string;
              const hasUpvoted = post.upvoted_by?.includes(user.uid);
              const isOwnPost = post.authorUid === user.uid || post.author === profile?.name;
              const isCommentsOpen = activeCommentPostId === postId;
              const comments = commentsMap[postId] || [];
              const commentInput = commentInputMap[postId] || '';

              return (
                <div
                  key={postId}
                  className={`bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm transition-all hover:shadow-md ${getTypeStyles(post.type)}`}
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 font-bold flex items-center justify-center shrink-0 border border-gray-200 text-sm">
                      {post.author?.charAt(0).toUpperCase() || 'A'}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm">{post.author}</h4>
                          {isOwnPost && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 flex items-center gap-0.5">
                              <UserCheck className="w-3 h-3" /> You
                            </span>
                          )}
                        </div>

                        <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700">
                          {getTypeIcon(post.type)} {post.type}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-400 font-medium">
                        {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just now'}
                      </p>

                      {post.title && <h3 className="text-base font-bold text-gray-900 pt-1">{post.title}</h3>}

                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {post.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-md text-xs font-medium text-gray-600 flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5 text-gray-400" /> #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Post Action Footer */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleUpvote(postId)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                              hasUpvoted
                                ? 'bg-red-50 text-red-600 shadow-2xs'
                                : 'text-gray-500 hover:text-red-500 hover:bg-gray-50'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${hasUpvoted ? 'fill-red-500 text-red-500' : ''}`} />
                            {post.upvotes || 0} Upvotes
                          </button>

                          <button
                            onClick={() => toggleCommentsView(postId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 font-semibold transition-colors"
                          >
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            {post.repliesCount || comments.length || 0} Comments
                            {isCommentsOpen ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                          </button>
                        </div>

                        {isOwnPost && (
                          <button
                            onClick={() => handleDeletePost(postId)}
                            className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Comments Dropdown List Section */}
                      {isCommentsOpen && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 bg-gray-50/70 p-4 rounded-xl animate-fade-in">
                          <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Comments & Discussion</h5>

                          {/* Comment Form */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={commentInput}
                              onChange={(e) =>
                                setCommentInputMap(prev => ({ ...prev, [postId]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddComment(postId);
                                }
                              }}
                              placeholder="Write a comment or answer..."
                              className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            />
                            <button
                              onClick={() => handleAddComment(postId)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" /> Comment
                            </button>
                          </div>

                          {commentErrorMap[postId] && (
                            <p className="text-xs text-red-600 font-medium">{commentErrorMap[postId]}</p>
                          )}

                          {/* Comments List */}
                          {loadingCommentsPostId === postId ? (
                            <div className="flex justify-center py-4 text-gray-400">
                              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                            </div>
                          ) : comments.length === 0 ? (
                            <p className="text-xs text-gray-400 font-medium py-2">No comments yet. Start the conversation!</p>
                          ) : (
                            <div className="space-y-3 pt-2">
                              {comments.map((comment, i) => (
                                <div key={comment._id || comment.id || i} className="bg-white p-3 rounded-xl border border-gray-200/60 text-xs space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900">{comment.author}</span>
                                    <span className="text-[10px] text-gray-400">
                                      {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString() : 'Just now'}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 font-normal leading-relaxed">{comment.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {!initialLoading && !feedError && posts.length === 0 && (
              <EmptyState title="No community posts yet" description="Be the first to share a win, ask a question, or post a learning resource!" />
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="w-full lg:w-[320px] space-y-6 shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Top Community Contributors
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Aarav Sharma', score: 142, role: 'Mentor' },
                { name: 'Priya Patel', score: 98, role: 'Student' },
                { name: 'Rohan Verma', score: 86, role: 'GSoC Alum' },
                { name: 'Ananya Gupta', score: 74, role: 'Student' },
                { name: 'Dev Sharma', score: 62, role: 'Hackathon Lead' }
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-none">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">{c.name}</span>
                      <span className="text-[10px] text-gray-400">{c.role}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    ★ {c.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-900 text-base">Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
              {['#GSoC2026', '#MLH', '#IndiaScholarships', '#OpenSource', '#SystemDesign', '#Hackathon'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

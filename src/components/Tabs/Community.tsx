import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from 'firebase/firestore';
import { Trophy, Megaphone, HelpCircle, Link as LinkIcon, Send, Heart, MessageSquare, Loader2 } from 'lucide-react';
import { UserProfile } from '../../types';
import { EmptyState, ErrorState, SkeletonCard } from '../ui/states';

export default function Community({ user, profile }: { user: any, profile: UserProfile | null }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('Win');
  const [pageSize, setPageSize] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  
  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && posts.length >= pageSize) {
        setPageSize(prev => prev + 10);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingMore, posts.length, pageSize]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'community_posts'), orderBy('timestamp', 'desc'), limit(pageSize));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(p);
      setFeedError(null);
      setInitialLoading(false);
    }, () => {
      setFeedError('Unable to load community posts. Please try again.');
      setInitialLoading(false);
    });
    return () => unsubscribe();
  }, [user, pageSize]);

  const handlePost = async () => {
    if (!postContent.trim() || !user || posting) return;
    setPosting(true);
    setPostError(null);
    try {
      await addDoc(collection(db, 'community_posts'), {
        uid: user.uid,
        userName: profile?.name || user.displayName || 'Anonymous Operative',
        content: postContent,
        type: postType,
        timestamp: serverTimestamp(),
        likes: 0,
        replies: 0,
      });
      setPostContent('');
    } catch {
      setPostError('Unable to publish your post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const getTypeStyles = (type: string) => {
    switch(type) {
      case 'Win': return 'border-l-4 border-l-amber-500';
      case 'Update': return 'border-l-4 border-l-blue-600';
      case 'Question': return 'border-l-4 border-l-purple-600';
      case 'Resource': return 'border-l-4 border-l-green-600';
      default: return 'border-l-4 border-l-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Win': return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'Update': return <Megaphone className="w-4 h-4 text-blue-600" />;
      case 'Question': return <HelpCircle className="w-4 h-4 text-purple-600" />;
      case 'Resource': return <LinkIcon className="w-4 h-4 text-green-600" />;
      default: return null;
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Community Access Restricted</h2>
        <p className="text-gray-500">Please sign in to join the community discussions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Community & Live Updates</h2>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Feed */}
        <div className="flex-1 space-y-6">
          
          {/* Composer */}
          <div className="clean-card p-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                {profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 space-y-4">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share your win, update, or question..."
                  className="w-full clean-input p-3 min-h-[100px] resize-none"
                ></textarea>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-2">
                    {['Win', 'Update', 'Question', 'Resource'].map(t => (
                      <button
                        key={t}
                        onClick={() => setPostType(t)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors border ${postType === t ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <button onClick={handlePost} className="clean-btn px-6 py-2 flex items-center gap-2">
                    {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts list */}
          <div className="space-y-4">
            {postError ? <ErrorState title="Post not published" description={postError} /> : null}
            {initialLoading ? <SkeletonCard count={3} /> : null}
            {!initialLoading && feedError ? <ErrorState title="Community unavailable" description={feedError} /> : null}
            {!initialLoading && !feedError && posts.map((post, index) => {
              const isLast = index === posts.length - 1;
              return (
                <div 
                  key={post.id} 
                  ref={isLast ? lastPostRef : null}
                  className={`clean-card p-6 ${getTypeStyles(post.type)}`}
                >
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold shrink-0">
                      {post.userName?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{post.userName}</h4>
                        <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">
                          {getTypeIcon(post.type)} {post.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">
                        {post.timestamp ? new Date(post.timestamp.toDate()).toLocaleString() : 'Just now'}
                      </p>
                      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-6">
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" /> {post.likes}
                        </button>
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                          <MessageSquare className="w-4 h-4" /> {post.replies} replies
                        </button>
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors ml-auto">
                          <LinkIcon className="w-4 h-4" /> Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {!initialLoading && !feedError && posts.length === 0 ? (
              <EmptyState title="No community posts yet" description="Be the first to share a win, update, question, or resource." />
            ) : null}
            
            {posts.length >= pageSize && (
              <div className="py-4 flex justify-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[320px] space-y-6">
          <div className="clean-card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Top Contributors</h3>
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">U{i}</div>
                    <span className="text-sm font-medium text-gray-700">User {i}</span>
                  </div>
                  <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> {10 - i}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="clean-card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Trending</h3>
            <div className="flex flex-wrap gap-2">
              {['#GSoC2025', '#MLH', '#IndiaScholarships', '#OpenSource', '#Hackathon'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full cursor-pointer hover:bg-gray-200">
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

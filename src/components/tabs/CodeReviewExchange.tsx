import React, { useState, useEffect } from 'react';
import { Code2, Search, Filter, Plus, CheckCircle, ExternalLink, Star, MessageSquare, AlertCircle } from 'lucide-react';
import { 
  fetchReviewRequests, 
  createReviewRequest, 
  claimReview, 
  submitReviewFeedback, 
  fetchMyReviews 
} from '../../services/apiClient';
import { useAppContext } from '../../context/AppContext';

export default function CodeReviewExchange() {
  const { user, profile } = useAppContext();
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'mine'>('feed');
  const [requests, setRequests] = useState<any[]>([]);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRequest, setNewRequest] = useState({ title: '', description: '', language: '', prUrl: '', codeSnippet: '', tags: '' });

  // Feedback form state
  const [feedback, setFeedback] = useState({ correctness: 3, readability: 3, bestPractices: 3, comments: '' });

  const loadFeed = async () => {
    setLoading(true);
    try {
      const data = await fetchReviewRequests();
      setRequests(data.items || data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  const loadMyReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchMyReviews();
      setMyReviews(data.items || data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load my reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'feed') {
      loadFeed();
    } else {
      loadMyReviews();
    }
  }, [activeSubTab]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = newRequest.tags.split(',').map(t => t.trim()).filter(Boolean);
      await createReviewRequest({
        ...newRequest,
        tags: tagsArray
      });
      setShowCreateModal(false);
      setNewRequest({ title: '', description: '', language: '', prUrl: '', codeSnippet: '', tags: '' });
      loadFeed();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleClaim = async (id: string) => {
    try {
      await claimReview(id, profile?.name || user?.displayName || user?.email?.split('@')[0]);
      alert("Review claimed successfully!");
      if (activeSubTab === 'feed') loadFeed();
      else loadMyReviews();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      await submitReviewFeedback(selectedRequest.id, {
        correctnessScore: feedback.correctness,
        readabilityScore: feedback.readability,
        bestPracticesScore: feedback.bestPractices,
        comments: feedback.comments
      });
      alert("Feedback submitted successfully! You earned Karma.");
      setSelectedRequest(null);
      setFeedback({ correctness: 3, readability: 3, bestPractices: 3, comments: '' });
      if (activeSubTab === 'feed') loadFeed();
      else loadMyReviews();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Peer Code Review Exchange
          </h2>
          <p className="text-sm text-gray-500 mt-1">Get feedback on your code and earn karma by reviewing others.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveSubTab('feed')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeSubTab === 'feed' ? 'bg-surface dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveSubTab('mine')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeSubTab === 'mine' ? 'bg-surface dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              My Reviews
            </button>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Submit Code
          </button>
        </div>
      </div>

      {/* Main Content Area: Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Feed */}
        <div className="w-full lg:w-1/2 border-r border-gray-100 dark:border-gray-800 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center p-8">
               <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
          ) : (activeSubTab === 'feed' ? requests : myReviews).length === 0 ? (
             <div className="text-center p-8 text-gray-500">No review requests found.</div>
          ) : (
            (activeSubTab === 'feed' ? requests : myReviews).map(req => (
              <div 
                key={req.id} 
                onClick={() => setSelectedRequest(req)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedRequest?.id === req.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-4">{req.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${req.status === 'open' ? 'bg-green-100 text-green-700' : req.status === 'in_review' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                    {req.status === 'open' ? 'Open' : req.status === 'in_review' ? 'In Review' : 'Completed'}
                  </span>
                </div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-medium">{req.language}</span>
                  {req.tags?.map((tag: string) => (
                    <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{req.description}</p>
                <div className="mt-3 text-xs text-gray-400 flex items-center justify-between">
                  <span>By {req.requesterName}</span>
                  <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Detail / Feedback Panel */}
        <div className="hidden lg:flex flex-col w-1/2 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-6">
          {selectedRequest ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRequest.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>Requested by <strong>{selectedRequest.requesterName}</strong></span>
                  {selectedRequest.reviewerName && <span>Reviewer: <strong>{selectedRequest.reviewerName}</strong></span>}
                </div>
              </div>
              
              <div className="bg-surface dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{selectedRequest.description}</p>
              </div>

              {selectedRequest.prUrl && (
                <div className="bg-surface dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Pull Request</h4>
                    <a href={selectedRequest.prUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1 mt-1">
                      {selectedRequest.prUrl} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {selectedRequest.codeSnippet && (
                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-100 font-mono">
                    <code>{selectedRequest.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Actions based on status and user */}
              {selectedRequest.status === 'open' && selectedRequest.requesterId !== user?.uid && (
                <button 
                  onClick={() => handleClaim(selectedRequest.id)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Claim Review
                </button>
              )}

              {selectedRequest.status === 'in_review' && selectedRequest.reviewerId === user?.uid && (
                <form onSubmit={handleSubmitFeedback} className="bg-surface dark:bg-gray-800 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b pb-2">Provide Feedback</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Correctness (1-5)</label>
                      <input type="range" min="1" max="5" value={feedback.correctness} onChange={e => setFeedback({...feedback, correctness: parseInt(e.target.value)})} className="w-full" />
                      <div className="text-center text-sm font-bold text-blue-600">{feedback.correctness}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Readability (1-5)</label>
                      <input type="range" min="1" max="5" value={feedback.readability} onChange={e => setFeedback({...feedback, readability: parseInt(e.target.value)})} className="w-full" />
                      <div className="text-center text-sm font-bold text-blue-600">{feedback.readability}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Best Practices (1-5)</label>
                      <input type="range" min="1" max="5" value={feedback.bestPractices} onChange={e => setFeedback({...feedback, bestPractices: parseInt(e.target.value)})} className="w-full" />
                      <div className="text-center text-sm font-bold text-blue-600">{feedback.bestPractices}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Comments</label>
                    <textarea 
                      required
                      minLength={10}
                      rows={4}
                      value={feedback.comments}
                      onChange={e => setFeedback({...feedback, comments: e.target.value})}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-surface dark:bg-gray-700 p-2 text-sm"
                      placeholder="Detailed feedback..."
                    ></textarea>
                  </div>

                  <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors">
                    Submit Feedback & Earn Karma
                  </button>
                </form>
              )}
              
              {selectedRequest.status === 'completed' && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-xl flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Review Completed</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a request to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Submit Code for Review</h2>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required minLength={5} type="text" value={newRequest.title} onChange={e => setNewRequest({...newRequest, title: e.target.value})} className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (What needs review?)</label>
                <textarea required minLength={20} rows={3} value={newRequest.description} onChange={e => setNewRequest({...newRequest, description: e.target.value})} className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Language / Framework</label>
                  <input required type="text" value={newRequest.language} onChange={e => setNewRequest({...newRequest, language: e.target.value})} className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2" placeholder="e.g. React, Python" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                  <input type="text" value={newRequest.tags} onChange={e => setNewRequest({...newRequest, tags: e.target.value})} className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2" placeholder="e.g. bug, refactor" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GitHub PR URL (Optional)</label>
                <input type="url" value={newRequest.prUrl} onChange={e => setNewRequest({...newRequest, prUrl: e.target.value})} className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2" placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Or Paste Code Snippet (Optional)</label>
                <textarea rows={5} value={newRequest.codeSnippet} onChange={e => setNewRequest({...newRequest, codeSnippet: e.target.value})} className="w-full font-mono text-sm rounded-lg border-gray-300 dark:border-gray-700 bg-gray-900 text-gray-100 p-2" placeholder="paste code here..."></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

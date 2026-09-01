import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart2, Loader2, Sparkles, Send, Plus, Minus, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useSocket } from '../../context/SocketContext';
import { EmptyState, SkeletonCard } from '../ui/states';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  _id?: string;
  id?: string;
  question: string;
  options: PollOption[];
  allowMultipleVotes: boolean;
  expiresAt: string | null;
  authorUid: string;
  authorName: string;
  voters: string[];
  status: 'active' | 'closed';
  createdAt: string;
}

export default function PollStudio() {
  const { user, profile } = useAppContext();
  const { socket, isConnected } = useSocket();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Poll Creator State
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([{ id: 'opt_1', text: '' }, { id: 'opt_2', text: '' }]);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchPolls = async () => {
    try {
      const res = await fetch('/api/v1/polls');
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const pollList = Array.isArray(data) ? data : (data.items ?? data.data ?? []);
      setPolls(pollList);
    } catch (err) {
      console.error('Error fetching polls:', err);
      setError('Unable to fetch live polls.');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    void fetchPolls();
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;
    
    // Listen for vote updates
    socket.on('poll_update', (updatedPoll: Poll) => {
      setPolls(prev => prev.map(p => {
        const id1 = p.id || p._id;
        const id2 = updatedPoll.id || updatedPoll._id;
        return id1 === id2 ? updatedPoll : p;
      }));
    });

    return () => {
      socket.off('poll_update');
    };
  }, [socket, isConnected]);

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !user || creating) return;
    
    const validOptions = options.filter(o => o.text.trim().length > 0);
    if (validOptions.length < 2) {
      setCreateError('You must provide at least 2 options.');
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const res = await fetch('/api/v1/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          options: validOptions,
          allowMultipleVotes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create poll');

      setPolls(prev => [data.poll || data.data || data, ...prev]);
      setQuestion('');
      setOptions([{ id: 'opt_1', text: '' }, { id: 'opt_2', text: '' }]);
      setAllowMultipleVotes(false);
    } catch (err: any) {
      setCreateError(err.message || 'Error creating poll');
    } finally {
      setCreating(false);
    }
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, { id: `opt_${Date.now()}`, text: '' }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user) return;
    
    const poll = polls.find(p => (p.id || p._id) === pollId);
    if (!poll) return;
    
    if (!poll.allowMultipleVotes && poll.voters.includes(user.uid)) return;

    // Optimistic update
    setPolls(prev => prev.map(p => {
      const pid = p.id || p._id;
      if (pid === pollId) {
        return {
          ...p,
          options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o),
          voters: p.allowMultipleVotes ? p.voters : [...p.voters, user.uid]
        };
      }
      return p;
    }));

    try {
      await fetch(`/api/v1/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId })
      });
    } catch (err) {
      console.error('Error casting vote:', err);
      // Rollback is skipped for brevity, wait for socket update
    }
  };

  if (!user) {
    return (
      <div className="w-full max-w-[1400px] mx-auto py-16 flex flex-col items-center justify-center p-10 text-center bg-surface dark:bg-slate-900 rounded-3xl border border-border-theme dark:border-slate-800 space-y-4">
        <BarChart2 className="w-12 h-12 text-primary-blue" />
        <h2 className="text-2xl font-serif font-bold text-text-primary dark:text-white">Poll Access Restricted</h2>
        <p className="text-xs text-text-secondary dark:text-slate-400 max-w-sm font-medium">Please sign in to participate in student polls and surveys.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface dark:bg-slate-900 p-6 rounded-3xl border border-border-theme dark:border-slate-800 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#603620] text-[#f3e4bd] text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart2 className="w-3.5 h-3.5 text-[#f3e4bd]" />
            <span>Community Polls</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-text-primary dark:text-white tracking-tight">
            Poll <span className="text-primary-blue italic">Studio</span>
          </h1>
          <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">
            Create and participate in real-time polls to gather insights from the community.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Feed Column */}
        <div className="flex-1 space-y-6">
          {/* Poll Creator Box */}
          <form onSubmit={handleCreatePoll} className="bg-surface dark:bg-slate-900 p-6 rounded-3xl border border-border-theme dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-2xl bg-[#603620] text-[#f3e4bd] flex items-center justify-center font-serif font-bold text-base shrink-0 shadow-2xs">
                {profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question (e.g. Which tech stack are you learning?)"
                  className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-text-primary dark:text-white outline-none font-bold"
                />
                
                <div className="space-y-2 pt-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-text-primary dark:text-white outline-none font-medium"
                      />
                      {options.length > 2 && (
                        <button type="button" onClick={() => removeOption(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer">
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {options.length < 10 && (
                  <button type="button" onClick={addOption} className="text-xs text-primary-blue font-bold flex items-center gap-1 hover:underline cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> Add Option
                  </button>
                )}
              </div>
            </div>

            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                {createError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-border-theme dark:border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-text-secondary dark:text-slate-300 font-bold">
                <input
                  type="checkbox"
                  checked={allowMultipleVotes}
                  onChange={(e) => setAllowMultipleVotes(e.target.checked)}
                  className="rounded text-primary-blue focus:ring-[#b56b37]"
                />
                Allow multiple votes
              </label>

              <button
                type="submit"
                disabled={creating || !question.trim()}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-3.5 h-3.5" /> Create Poll</>}
              </button>
            </div>
          </form>

          {/* Polls List Feed */}
          {initialLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : polls.length === 0 ? (
            <EmptyState title="No polls available" description="Create the first community poll!" />
          ) : (
            polls.map(p => {
              const pid = p.id || p._id || 'poll_' + Math.random();
              const hasVoted = p.voters?.includes(user.uid);
              const totalVotes = p.options.reduce((sum, opt) => sum + opt.votes, 0);

              return (
                <div key={pid} className="bg-surface dark:bg-slate-900 p-6 rounded-3xl border border-border-theme dark:border-slate-800 shadow-2xs space-y-4 hover:border-primary-blue transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#603620] text-[#f3e4bd] flex items-center justify-center font-serif font-bold text-xs">
                        {p.authorName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-text-primary dark:text-white">{p.authorName}</h4>
                        <span className="text-[10px] text-text-muted font-medium">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-background text-text-secondary border border-border-theme text-[10px] font-extrabold rounded-lg uppercase">
                      {totalVotes} Votes
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-text-primary dark:text-white">{p.question}</h3>

                  <div className="space-y-3 mt-4">
                    {p.options.map(opt => {
                      const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleVote(pid, opt.id)}
                          disabled={p.status === 'closed' || (!p.allowMultipleVotes && hasVoted)}
                          className={`w-full relative group text-left cursor-pointer disabled:cursor-default overflow-hidden rounded-xl border ${
                            p.status === 'closed' || (!p.allowMultipleVotes && hasVoted)
                              ? 'border-border-theme bg-background dark:border-slate-700 dark:bg-slate-800' 
                              : 'border-border-theme hover:border-primary-blue bg-surface dark:bg-slate-900'
                          }`}
                        >
                          {/* Animated progress bar */}
                          <div 
                            className="absolute top-0 left-0 bottom-0 bg-surface-secondary dark:bg-blue-900/30 transition-all duration-1000 ease-out z-0"
                            style={{ width: `${percentage}%` }}
                          />
                          
                          <div className="relative z-10 flex justify-between items-center p-3 text-xs font-bold text-text-primary dark:text-white">
                            <span className="flex-1">{opt.text}</span>
                            {(hasVoted || p.status === 'closed') && (
                              <span className="text-text-secondary dark:text-slate-300 min-w-[40px] text-right">
                                {percentage}%
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-border-theme dark:border-slate-800 text-[10px] text-text-muted font-bold">
                    <span>{p.allowMultipleVotes ? 'Multiple votes allowed' : 'Single vote only'}</span>
                    <span>{p.status === 'closed' ? 'Closed' : 'Active'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

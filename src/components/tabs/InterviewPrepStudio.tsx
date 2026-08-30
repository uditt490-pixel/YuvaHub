import React, { useState, useMemo } from 'react';
import {
  Brain,
  Code2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Play,
  RotateCcw,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Search,
  Filter,
  Award,
  Zap,
  Target,
  FileText,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  X,
  Layers,
  Cpu,
  BarChart3
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function InterviewPrepStudio() {
  const { user, profile } = useAppContext();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'vault' | 'simulator' | 'star' | 'export'>('vault');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  // Question Vault State
  const [questions, setQuestions] = useState([
    {
      id: 'q_1',
      title: 'Design a Distributed Rate Limiter for High-Traffic APIs',
      category: 'System Design',
      difficulty: 'HARD',
      company: 'Google / Cloudflare',
      prompt: 'Describe how you would design a sliding window rate limiter serving 100k req/sec across global regions using Redis and Token Bucket algorithms.',
      idealAnswer: 'Use Redis cluster with Lua scripts to perform atomic key counter increments and timestamp pruning in O(1) time.',
      solved: false,
      userAnswer: ''
    },
    {
      id: 'q_2',
      title: 'LRU Cache Implementation with O(1) Operations',
      category: 'Data Structures',
      difficulty: 'MEDIUM',
      company: 'Meta / Amazon',
      prompt: 'Implement a Least Recently Used (LRU) cache supporting get(key) and put(key, value) in O(1) time complexity.',
      idealAnswer: 'Combine a HashMap for O(1) key-node lookup with a Doubly LinkedList for O(1) head insertion and tail eviction.',
      solved: true,
      userAnswer: 'Used a HashMap and Doubly LinkedList structure.'
    },
    {
      id: 'q_3',
      title: 'React Reconciliation Engine & Virtual DOM Diffing',
      category: 'Frontend Core',
      difficulty: 'MEDIUM',
      company: 'Stripe / Vercel',
      prompt: 'Explain how React Fiber handles asynchronous work slicing, concurrent rendering priorities, and component tree diffing.',
      idealAnswer: 'Fiber splits rendering into incremental units of work executed during browser idle periods using requestIdleCallback.',
      solved: false,
      userAnswer: ''
    }
  ]);

  // Active Revealer State
  const [revealedIds, setRevealedIds] = useState<string[]>([]);

  // Timed Session Simulator State
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(1800); // 30 mins
  const [currentSimIndex, setCurrentSimIndex] = useState(0);
  const [simAnswer, setSimAnswer] = useState('');

  // STAR Behavioral Stories State
  const [starStories, setStarStories] = useState([
    {
      id: 'st_1',
      situation: 'Database bottleneck during 50,000 user hackathon submission spike.',
      task: 'Reduce query latency from 3.2s to under 150ms.',
      action: 'Implemented Redis caching layer and optimized MongoDB compound indexes on dedupe_hash.',
      result: 'API latency dropped to 42ms with 99.9% uptime.'
    }
  ]);
  const [newSit, setNewSit] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newAct, setNewAct] = useState('');
  const [newRes, setNewRes] = useState('');

  // Toggle Reveal Answer
  const toggleReveal = (qId: string) => {
    setRevealedIds(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  // Add STAR Story
  const handleAddStarStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSit.trim() || !newAct.trim()) return;

    const newStory = {
      id: `st_${Date.now()}`,
      situation: newSit.trim(),
      task: newTask.trim() || 'Achieve performance benchmark.',
      action: newAct.trim(),
      result: newRes.trim() || 'Successfully delivered expected target metrics.'
    };

    setStarStories([...starStories, newStory]);
    setNewSit('');
    setNewTask('');
    setNewAct('');
    setNewRes('');
    setNotification({ type: 'success', message: 'Added STAR Behavioral story to your vault!' });
  };

  // Export Manifest JSON
  const handleExportManifest = () => {
    const manifest = {
      user: profile?.name || user?.displayName || 'Student Developer',
      questionVault: questions,
      starBehavioralStories: starStories,
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_Interview_Prep_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setNotification({ type: 'success', message: 'Exported Interview Prep JSON Manifest!' });
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === 'all' || q.category === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">
      
      {/* Top Banner Header - Brand Theme */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                <Brain className="w-3.5 h-3.5 text-indigo-400" /> AI Mock Interview Studio
              </span>
              <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30">
                System Design & Coding
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              AI Mock Interview <span className="text-primary-blue italic">Room</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Practice System Design, Data Structures, and STAR behavioral interview questions with AI model answers and timed mock sessions.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full shadow-xs">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-4 border-primary-blue bg-background font-serif font-bold text-base text-primary-blue">
              92%
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Interview Readiness</div>
              <div className="text-xs font-extrabold text-white">FAANG Ready</div>
              <div className="text-[11px] text-emerald-400 font-semibold">{questions.filter(q => q.solved).length} of {questions.length} Questions Solved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-border-theme dark:border-slate-800 pb-3">
        {[
          { id: 'vault', label: 'Question Vault', icon: Code2 },
          { id: 'simulator', label: '30-Min Timed Simulator', icon: Clock },
          { id: 'star', label: 'STAR Behavioral Builder', icon: Sparkles },
          { id: 'export', label: 'Export Transcript', icon: Download }
        ].map(tab => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-primary-blue border-primary-blue text-white shadow-sm scale-[1.02]'
                  : 'bg-surface dark:bg-slate-900 border-border-theme dark:border-slate-800 text-text-secondary dark:text-slate-300 hover:bg-surface-secondary'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-primary-blue'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notification Banner */}
      {notification.message && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#63703d]/15 text-[#63703d] border border-[#63703d]/30 text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab 1: Question Vault */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
            <div className="relative flex-1 w-full sm:w-auto max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search questions by topic or title..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary dark:text-white outline-none focus:border-primary-blue"
              />
            </div>

            <div className="flex items-center gap-2">
              {['all', 'System Design', 'Data Structures', 'Frontend Core'].map(top => (
                <button
                  key={top}
                  onClick={() => setSelectedTopic(top)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    selectedTopic === top
                      ? 'bg-[#231f20] text-white border-[#231f20]'
                      : 'bg-surface border-border-theme text-text-secondary hover:bg-surface-secondary'
                  }`}
                >
                  {top}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map(q => {
              const isRevealed = revealedIds.includes(q.id);
              return (
                <div key={q.id} className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4 hover:border-primary-blue transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{q.company}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#f3e4bd] text-text-secondary">
                          {q.category}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-text-primary dark:text-white mt-1">{q.title}</h3>
                    </div>

                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${
                      q.difficulty === 'HARD' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed font-medium bg-background dark:bg-slate-800 p-4 rounded-xl border border-border-theme dark:border-slate-700">
                    {q.prompt}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => toggleReveal(q.id)}
                      className="px-4 py-2 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
                    >
                      {isRevealed ? 'Hide AI Model Solution' : 'Reveal AI Model Solution'}
                    </button>

                    {q.solved && (
                      <span className="text-xs font-bold text-[#63703d] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Solved
                      </span>
                    )}
                  </div>

                  {isRevealed && (
                    <div className="p-4 rounded-xl bg-[#63703d]/15 border border-[#63703d]/30 text-xs font-medium text-text-primary dark:text-slate-200 animate-fade-in space-y-1">
                      <span className="font-bold text-[#63703d] uppercase tracking-wider block text-[10px]">AI Ideal Solution Strategy:</span>
                      <p>{q.idealAnswer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Timed Simulator */}
      {activeTab === 'simulator' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs max-w-2xl mx-auto">
          <div className="border-b border-border-theme dark:border-slate-800 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white">30-Minute Mock Session</h2>
              <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">Simulate real interview conditions with AI evaluation.</p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#603620] text-[#f3e4bd] font-serif font-bold text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#f3e4bd]" /> 30:00
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-background border border-border-theme">
              <span className="text-[10px] font-bold text-text-muted uppercase">Question 1 of 3</span>
              <h3 className="font-serif font-bold text-sm text-text-primary mt-1">{questions[0].title}</h3>
              <p className="text-xs text-text-secondary mt-2 font-medium">{questions[0].prompt}</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text-secondary uppercase">Your Solution / Architecture Strategy</label>
              <textarea
                rows={5}
                placeholder="Write your explanation or code solution here..."
                value={simAnswer}
                onChange={e => setSimAnswer(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none resize-none font-mono"
              />
            </div>

            <button
              onClick={() => {
                setNotification({ type: 'success', message: 'Submitted answer for AI evaluation!' });
                setSimAnswer('');
              }}
              className="w-full py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Submit Solution to AI Evaluator
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: STAR Behavioral Builder */}
      {activeTab === 'star' && (
        <div className="space-y-6">
          <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs max-w-2xl mx-auto">
            <div className="border-b border-border-theme dark:border-slate-800 pb-4">
              <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white">STAR Behavioral Story Builder</h2>
              <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">Draft Situation, Task, Action, and Result framework stories for behavioral interviews.</p>
            </div>

            <form onSubmit={handleAddStarStory} className="space-y-3 text-xs">
              <input type="text" required placeholder="Situation (What happened?)" value={newSit} onChange={e => setNewSit(e.target.value)} className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none" />
              <input type="text" placeholder="Task (What was required?)" value={newTask} onChange={e => setNewTask(e.target.value)} className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none" />
              <input type="text" required placeholder="Action (What did YOU do?)" value={newAct} onChange={e => setNewAct(e.target.value)} className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none" />
              <input type="text" placeholder="Result (Quantifiable outcome)" value={newRes} onChange={e => setNewRes(e.target.value)} className="w-full bg-background border border-border-theme rounded-xl p-3 text-xs text-text-primary outline-none" />

              <button type="submit" className="w-full py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Save STAR Behavioral Story
              </button>
            </form>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            {starStories.map((st, idx) => (
              <div key={st.id} className="p-5 rounded-2xl bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 shadow-2xs space-y-2">
                <h4 className="font-serif font-bold text-sm text-text-primary dark:text-white">Story #{idx + 1}: {st.situation}</h4>
                <p className="text-xs text-text-secondary font-semibold">Action: {st.action}</p>
                <p className="text-xs text-[#63703d] font-bold">Result: {st.result}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Export */}
      {activeTab === 'export' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xs max-w-xl mx-auto">
          <div className="w-16 h-16 bg-surface-secondary text-primary-blue flex items-center justify-center rounded-full mx-auto border border-border-theme">
            <Download className="w-8 h-8 text-primary-blue" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-text-primary dark:text-white">Export Interview Transcript</h2>
          <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">
            Download full solved question history and STAR behavioral stories in JSON format.
          </p>
          <button onClick={handleExportManifest} className="px-6 py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Interview Prep JSON Manifest
          </button>
        </div>
      )}
    </div>
  );
}

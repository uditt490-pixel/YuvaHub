import React, { useState } from 'react';
import { Video, Send, Loader2, Sparkles, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function MockInterviewStudio() {
  const { user } = useAppContext();

  const [jobRole, setJobRole] = useState('Full-Stack Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Junior / Entry-Level');
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [evaluationReport, setEvaluationReport] = useState<string | null>(null);

  const startInterviewSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEvaluationReport(null);
    setMessages([]);

    try {
      const res = await fetch('/api/v1/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid || 'anon', jobRole, experienceLevel })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start interview');

      setSessionId(data.sessionId);
      setMessages([{ sender: 'ai', text: data.question }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnswer.trim() || !sessionId || loading) return;

    const userText = currentAnswer.trim();
    setCurrentAnswer('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/interview/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answer: userText })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process turn');

      if (data.isComplete) {
        setEvaluationReport(data.report);
        setSessionId(null);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: data.question }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">
      {/* Header */}
      <div className="bg-surface dark:bg-slate-900 p-6 rounded-3xl border border-border-theme dark:border-slate-800 shadow-2xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#603620] text-[#f3e4bd] text-xs font-bold uppercase tracking-wider mb-2">
          <Video className="w-3.5 h-3.5 text-[#f3e4bd]" />
          <span>AI Recruiter Simulation</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-text-primary dark:text-white tracking-tight">
          Mock Interview <span className="text-primary-blue italic">Studio</span>
        </h1>
        <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">
          Practice technical and behavioral interviews live with Gemini. Get real-time conversational questions and a comprehensive evaluation report.
        </p>
      </div>

      {!sessionId && !evaluationReport ? (
        <div className="max-w-xl mx-auto bg-surface dark:bg-slate-900 p-8 rounded-3xl border border-border-theme dark:border-slate-800 shadow-2xs space-y-6">
          <h2 className="text-lg font-serif font-bold text-text-primary dark:text-white">Configure Your Interview</h2>
          
          <form onSubmit={startInterviewSession} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-text-secondary dark:text-slate-300 mb-1">Target Job Role</label>
              <input 
                type="text" 
                value={jobRole}
                onChange={e => setJobRole(e.target.value)}
                required
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-text-primary dark:text-white outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-text-secondary dark:text-slate-300 mb-1">Experience Level</label>
              <select 
                value={experienceLevel}
                onChange={e => setExperienceLevel(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-text-primary dark:text-white outline-none font-bold"
              >
                <option value="Junior / Entry-Level">Junior / Entry-Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-3.5 h-3.5" /> Start Interview Session</>}
            </button>
          </form>
        </div>
      ) : evaluationReport ? (
        <div className="max-w-3xl mx-auto bg-surface dark:bg-slate-900 p-8 rounded-3xl border border-border-theme dark:border-slate-800 shadow-2xs space-y-6">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-primary-blue" />
            <div>
              <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white">Interview Evaluation Report</h2>
              <p className="text-xs text-text-secondary">Generated by AI Recruiter Studio</p>
            </div>
          </div>

          <div className="p-6 bg-background dark:bg-slate-800 rounded-2xl border border-border-theme text-xs text-text-primary dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
            {evaluationReport}
          </div>

          <button
            onClick={() => setEvaluationReport(null)}
            className="px-6 py-2.5 bg-primary-blue text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Start New Interview
          </button>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto bg-surface dark:bg-slate-900 rounded-3xl border border-border-theme dark:border-slate-800 shadow-2xs flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-border-theme flex justify-between items-center bg-background dark:bg-slate-800 rounded-t-3xl">
            <span className="font-bold text-xs text-text-primary dark:text-white">Active Session: {jobRole}</span>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full uppercase">Live AI Interview</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-primary-blue text-white rounded-br-none' 
                    : 'bg-background dark:bg-slate-800 text-text-primary dark:text-slate-200 border border-border-theme rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="p-4 rounded-2xl bg-background dark:bg-slate-800 border border-border-theme flex items-center gap-2 text-xs text-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-blue" />
                  Recruiter is typing next question...
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border-theme bg-background dark:bg-slate-800 rounded-b-3xl flex gap-3">
            <input 
              type="text"
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
              placeholder="Type your response to the recruiter..."
              disabled={loading}
              className="flex-1 bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-text-primary dark:text-white outline-none font-medium"
            />
            <button
              type="submit"
              disabled={loading || !currentAnswer.trim()}
              className="px-6 py-2.5 bg-primary-blue text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

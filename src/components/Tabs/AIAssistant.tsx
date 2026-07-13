import React, { useState } from 'react';
import { FileText, Bot, Briefcase, GraduationCap, Sparkles, ChevronRight, CheckCircle, Search, ScrollText, Send } from 'lucide-react';
import { UserProfile } from '../../types';
import * as geminiService from '../../services/gemini';
import { ErrorState } from '../ui/states';

interface AIAssistantProps {
  user: any;
  profile: UserProfile | null;
}

export default function AIAssistant({ user, profile }: AIAssistantProps) {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  
  const modules = [
    { id: 'resume_review', title: 'AI Resume Review', icon: FileText, desc: 'Paste your resume for instant tailored feedback.', color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'cover_letter', title: 'Cover Letter Generator', icon: ScrollText, desc: 'Generate a professional cover letter in seconds.', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'interview_prep', title: 'Mock Interview Prep', icon: Briefcase, desc: 'Practice technical or behavioral interview questions.', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'career_mentor', title: 'Career Guidance', icon: Bot, desc: 'Ask about paths, skills, or get a personalized roadmap.', color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'opp_finder', title: 'AI Opportunity Matcher', icon: Search, desc: 'Describe what you are looking for in plain language to get matched.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (!activeModule) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative hidden-scrollbar pb-16">
        <header>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            AI <span className="text-blue-600">Assistant</span>
          </h2>
          <p className="text-gray-500 font-medium">Accelerate your career with personalized AI tools and insights.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div 
                key={m.id} 
                onClick={() => setActiveModule(m.id)}
                className="clean-card p-8 group cursor-pointer hover:border-blue-200 hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-5">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${m.bg} ${m.color} group-hover:scale-110 transition-transform`}>
                     <Icon className="w-7 h-7" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                         {m.title}
                         <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                      </h3>
                      <p className="text-gray-500 text-sm">{m.desc}</p>
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-900 text-white p-10 rounded-2xl relative overflow-hidden mt-8 shadow-2xl">
           <div className="absolute top-0 right-0 p-8 w-full flex justify-end opacity-10 pointer-events-none">
              <Sparkles className="w-48 h-48 animate-pulse" />
           </div>
           <div className="relative z-10 max-w-2xl">
             <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
               <Bot className="w-6 h-6 text-blue-400" />
               YuvaHub Intelligence
             </h3>
             <p className="text-gray-300 mb-6 leading-relaxed text-sm">
                Our AI runs directly on Gemini 3.5 Flash models to ensure maximum speed and quality. 
                Whether you need a quick resume review before your college placement drive or a custom-tailored 
                cover letter, the YuvaHub Assistant connects your profile capabilities to real-world expectations.
             </p>
             <div className="flex gap-4">
                <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-white/10 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" /> Context-Aware
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-white/10 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" /> Free for Students
                </span>
             </div>
           </div>
        </div>
      </div>
    );
  }

  // --- SUB-VIEWS ---

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 relative">
      <button 
        onClick={() => setActiveModule(null)}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors px-3 py-1.5 -ml-3 rounded-lg hover:bg-blue-50 text-sm font-semibold"
      >
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Modules
      </button>

      {activeModule === 'resume_review' && <ResumeReview />}
      {activeModule === 'cover_letter' && <CoverLetter profile={profile} />}
      {activeModule === 'interview_prep' && <InterviewPrep profile={profile} />}
      {activeModule === 'career_mentor' && <CareerMentor user={user} />}
      {activeModule === 'opp_finder' && <AIOpportunityMatcher profile={profile} />}

    </div>
  );
}

// ---------------------------
// Resume Review Component
// ---------------------------
function ResumeReview() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleReview = async () => {
    if (!resumeText.trim()) return;
    if (loading) return;
    setLoading(true);
    setReviewError(null);
    try {
      // Direct call to Gemini via server proxy
      const res = await fetch("/api/v1/ai/resume_review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText })
      });
      const data = await res.json();
      setFeedback(data);
    } catch {
      setReviewError('Unable to analyze the resume right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-purple-600" /> AI Resume Review
        </h2>
        <p className="text-gray-500">Paste your resume content to identify structural gaps and receive ATS-optimizations.</p>
      </header>

      <div className="clean-card p-6">
        <textarea 
          placeholder="Paste your plain-text resume here..." 
          className="w-full h-64 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-600 outline-none resize-none font-mono"
          value={resumeText}
          onChange={e => setResumeText(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
           <button 
             onClick={handleReview} 
             disabled={loading || !resumeText}
             className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-md disabled:bg-gray-300 transition-colors flex items-center gap-2"
           >
             {loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Sparkles className="w-4 h-4" />}
             Analyze Resume
           </button>
        </div>
      </div>

      {reviewError ? <ErrorState title="Resume analysis failed" description={reviewError} onRetry={() => void handleReview()} retrying={loading} /> : null}

      {feedback && (
        <div className="clean-card p-8 animate-fade-in border-t-4 border-t-purple-600">
           <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
             <div>
               <h3 className="text-xl font-bold text-gray-900">Analysis Results</h3>
               <p className="text-sm text-gray-500">ATS compatibility and framing check</p>
             </div>
             <div className="text-right">
                <span className="text-4xl font-black text-purple-600">{feedback.score}</span><span className="text-gray-400 font-bold">/100</span>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Impact Score</p>
             </div>
           </div>

           <div className="space-y-6 text-sm">
              <div>
                <h4 className="font-bold text-green-700 flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4" /> Strengths</h4>
                <ul className="list-disc ml-5 text-gray-700 space-y-1">
                  {feedback.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-red-600 flex items-center gap-2 mb-2"><Search className="w-4 h-4" /> Areas for Improvement</h4>
                <ul className="list-disc ml-5 text-gray-700 space-y-1">
                  {feedback.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>)}
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-purple-800 flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4" /> Recommended Phrasing</h4>
                <ul className="list-disc ml-5 text-purple-900 space-y-1">
                  {feedback.suggestions?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------
// Cover Letter Component
// ---------------------------
function CoverLetter({ profile }: { profile: any }) {
  const [jobDesc, setJobDesc] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
    if (!jobDesc || !company) return;
    setLoading(true);
    try {
      const prompt = `Write a highly professional, strong, and concise cover letter for ${company}. The role involves: ${jobDesc}. Candidate profile: ${JSON.stringify(profile)}. Output plain text, formatting with normal line breaks.`;
      
      const res = await fetch("/api/v1/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      setResult(data.text || "Failed to generate.");
    } catch (e) {
      console.error(e);
      setResult("Dear Hiring Manager at " + company + ", ...\\n\\nSincerely,\\n" + (profile?.name || "Student"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <ScrollText className="w-8 h-8 text-blue-600" /> Cover Letter Generator
        </h2>
        <p className="text-gray-500">Provide the company and job description, and our AI will draft a compelling letter based on your profile.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="clean-card p-6 space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Target Company / Organization</label>
             <input className="clean-input w-full p-3 text-sm" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, XYZ Startup" />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Job Description or Role Title</label>
             <textarea className="clean-input w-full p-3 text-sm h-32 resize-none" value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="Paste responsibilities or job title..." />
           </div>
           <button 
             onClick={handleGenerate} 
             disabled={loading || !jobDesc || !company}
             className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
           >
             {loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Sparkles className="w-4 h-4" />}
             Generate Letter
           </button>
         </div>

         <div className="clean-card bg-gray-50 p-6 flex flex-col relative overflow-hidden">
            {result ? (
               <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-serif overflow-y-auto h-full">
                 {result}
               </div>
            ) : (
               <div className="m-auto text-gray-400 text-sm flex flex-col items-center justify-center text-center p-4">
                 <ScrollText className="w-12 h-12 mb-3 opacity-50" />
                 Your generated cover letter will appear here.
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

// ---------------------------
// Interview Prep Component
// ---------------------------
function InterviewPrep({ profile }: { profile: any }) {
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const startMock = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const prompt = `Generate a challenging, highly technical interview question for a student applying for ${topic}. Only return the question string. Profile context: ${profile?.field || 'Tech'}.`;
      const res = await fetch("/api/v1/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      setQuestion(data.text);
    } catch (e) {
      setQuestion("Explain how a Hash Map handles collisions under the hood, and how it scales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-green-600" /> Mock Interview
        </h2>
        <p className="text-gray-500">Practice behavioral and technical questions.</p>
      </header>

      <div className="clean-card p-6">
         <div className="flex gap-4 mb-8">
           <input className="clean-input flex-1 p-3 text-sm" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Software Engineering Intern, Product Manager" />
           <button onClick={startMock} disabled={loading || !topic} className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold shadow-md disabled:bg-gray-300">
             {loading ? "Generating..." : "Get Question"}
           </button>
         </div>

         {question && (
           <div className="p-8 bg-green-50 rounded-xl border border-green-100">
             <h3 className="text-sm font-bold tracking-wider text-green-800 uppercase mb-4">Interview Question</h3>
             <p className="text-xl font-medium text-gray-900">{question}</p>
             
             <div className="mt-8">
               <textarea className="w-full h-32 p-4 border border-green-200 rounded-lg text-sm mb-4 outline-none focus:ring-2 focus:ring-green-400" placeholder="Type your answer here to evaluate yourself..." />
               <button className="px-4 py-2 bg-white text-green-700 font-bold border border-green-300 rounded hover:bg-green-50">Self-Evaluate</button>
             </div>
           </div>
         )}
      </div>
    </div>
  );
}

// ---------------------------
// Career Mentor Component
// ---------------------------
function CareerMentor({ user }: { user: any }) {
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: number }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const SUGGESTIONS = [
    "How do I get into GSoC?",
    "Review my LinkedIn summary",
    "What skills do I need for ML internships?",
    "I'm a 2nd year CSE student, what should I do next?"
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await geminiService.chatWithMentor(history, text);
      const botMsg = { id: 'bot-'+Date.now(), role: 'assistant' as const, content: typeof response === 'string' ? response : JSON.stringify(response), timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const botMsg = { id: 'bot-'+Date.now(), role: 'assistant' as const, content: JSON.stringify({text: "Connection to logical pathways failed."}), timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (m: any) => {
    if (m.role === 'user') {
      return (
        <div className="max-w-[80%] p-4 rounded-2xl text-sm whitespace-pre-wrap bg-blue-600 text-white rounded-br-none shadow-sm">
          {m.content}
        </div>
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(m.content);
    } catch (e) {
      parsed = { text: m.content };
    }

    return (
      <div className="flex flex-col gap-3 max-w-[85%] sm:max-w-[75%]">
        <div className="p-4 rounded-2xl text-sm whitespace-pre-wrap bg-gray-100 text-gray-800 rounded-bl-none">
          {parsed.text || m.content}
        </div>
        
        {parsed.card && (
          <div className="clean-card p-4 border border-blue-100 bg-white shadow-sm">
            <h4 className="font-bold text-gray-900 mb-1">{parsed.card.title}</h4>
            <div className="text-sm text-blue-600 font-medium mb-2">{parsed.card.org} • {parsed.card.type}</div>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{parsed.card.description}</p>
            <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-3">
              <span className="text-xs text-red-500 font-semibold">{parsed.card.deadline || "Open"}</span>
              {parsed.card.applyLink && (
                <a href={parsed.card.applyLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors border border-blue-700">
                  Apply / Register
                </a>
              )}
            </div>
          </div>
        )}

        {parsed.options && parsed.options.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {parsed.options.map((opt: string, i: number) => (
              <button 
                key={i}
                onClick={() => handleSend(opt)}
                className="px-3 py-1.5 bg-white border border-blue-200 text-blue-800 shadow-sm text-xs font-medium rounded-full hover:bg-blue-50 transition-colors"
                disabled={isLoading}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 clean-card flex flex-col h-[600px] overflow-hidden bg-white border border-gray-100 shadow-sm">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col no-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center m-auto h-full text-center space-y-6 animate-in fade-in zoom-in duration-300 pb-8">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
               <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Yuva AI Career Mentor</h3>
              <p className="text-gray-500 text-sm font-medium animate-pulse">I help with career decisions, software paths, application strategies, and skills development.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-xl">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => handleSend(s)} className="px-3.5 py-1.5 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-full text-xs font-medium transition-colors">
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {renderMessageContent(m)}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(input) }}
            placeholder="Ask your mentor anything about paths, resume advice, or skills..."
            className="w-full pr-16 pl-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-sm transition-all shadow-inner"
          />
          <button onClick={() => handleSend(input)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------
// AI Opportunity Matcher Component
// ---------------------------
import { searchOpportunities as clientSearchOpportunities } from '../../services/apiClient';

function AIOpportunityMatcher({ profile }: { profile: any }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [refinedQuery, setRefinedQuery] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleMatchSearch = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const refined = await geminiService.refineSearchQuery(description, profile);
      setRefinedQuery(refined);

      const response = await clientSearchOpportunities(refined || description);
      if (response && response.results) {
        setMatches(response.results);
      } else {
        setMatches([]);
      }
    } catch (e) {
      console.error("Match search error:", e);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const SUGGESTED_DESCRIPTIONS = [
    "I am looking for a remote open source project or fellowship to learn Git & TypeScript.",
    "Show me summer software engineering internships at Google or Stripe with flexible options.",
    "A coding challenge or hackathon focusing on artificial intelligence with money rewards."
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <Search className="w-8 h-8 text-emerald-600" /> AI Opportunity Matcher
        </h2>
        <p className="text-gray-500">Describe what you are looking for in plain language, and we will find the absolute best-matching opportunities.</p>
      </header>

      <div className="clean-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Describe what you're seeking (e.g. skills, role type, company, timeline):</label>
          <textarea 
            className="w-full h-32 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-sans shadow-inner bg-slate-50/50" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="e.g. I am a sophomore interested in AI/ML software engineering. I prefer remote hackathons or internships where I can practice pytorch and collaborate with teams..."
          />
        </div>

        <div className="flex flex-wrap gap-2 pb-2">
          {SUGGESTED_DESCRIPTIONS.map((s, idx) => (
            <button 
              key={idx} 
              onClick={() => setDescription(s)} 
              className="text-left px-3.5 py-2 border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 bg-white rounded-xl text-xs font-semibold text-gray-650 hover:text-emerald-800 transition-all max-w-full cursor-pointer"
            >
              "{s}"
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button 
            onClick={handleMatchSearch} 
            disabled={loading || !description.trim()}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md disabled:bg-gray-300 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            {loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-100 fill-emerald-100" />}
            Find Best Matches
          </button>
        </div>
      </div>

      {searched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-950">Matched Opportunities</h3>
              {refinedQuery && (
                <p className="text-xs text-gray-500 mt-1">
                  AI Concentrated Keywords: <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-semibold text-[11px]">{refinedQuery}</span>
                </p>
              )}
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
              {matches.length} matches found
            </span>
          </div>

          {loading ? (
             <div className="clean-card p-12 text-center flex flex-col items-center justify-center space-y-4 bg-white">
                 <div className="w-12 h-12 rounded-full border-4 border-emerald-50 border-t-emerald-600 animate-spin" />
                 <p className="text-sm font-semibold text-gray-600">Yuva Scout Protocol analyzing match scores...</p>
             </div>
          ) : matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((item, idx) => (
                <div key={item.id || idx} className="clean-card p-6 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between h-full group bg-white border border-gray-150">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xxs font-black uppercase rounded-md tracking-wider">
                        {item.type || 'Opportunity'}
                      </span>
                      {item.match_score && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded">
                          {item.match_score}% Align
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-base line-clamp-1 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold mb-3">
                      {item.organization} • {item.location || 'Remote'}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags?.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-xxs font-bold text-slate-600 bg-[#F1F5F9] px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3.5 mt-auto">
                    <span className="text-xxs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                      {item.deadline || 'Rolling admission'}
                    </span>
                    <a 
                      href={item.apply_link || item.applyLink || "#"} 
                      target="_blank"  
                      rel="noopener noreferrer" 
                      className="px-3.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-750 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      Apply / Open
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="clean-card p-12 text-center text-gray-400 bg-white">
               <p className="text-sm font-semibold mb-2">No matching opportunities found for your query.</p>
               <p className="text-xs text-gray-500">Try broadening your description or searching with other keywords.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

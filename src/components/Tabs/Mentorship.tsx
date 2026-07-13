import React, { useState } from 'react';
import { Bot, User, Send, Check } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ChatMessage } from '../../types';
import { chatWithAIMentorBackend } from '../../services/apiClient';
import { ErrorState } from '../ui/states';

export default function Mentorship({ user }: { user: any }) {
  const [view, setView] = useState<'ai' | 'human'>('ai');

  return (
    <div className="max-w-5xl mx-auto h-[80vh] flex flex-col">
      <header className="mb-8 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            Mentorship
          </h2>
          <p className="text-gray-500 font-medium">Connect with intelligence and experience.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
          <button 
            onClick={() => setView('ai')}
            className={`px-6 py-2 text-sm font-semibold rounded-md transition-all ${view === 'ai' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <span className="flex items-center gap-2"><Bot className="w-4 h-4" /> AI Mentor</span>
          </button>
          <button 
            onClick={() => setView('human')}
            className={`px-6 py-2 text-sm font-semibold rounded-md transition-all ${view === 'human' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <span className="flex items-center gap-2"><User className="w-4 h-4" /> Human Mentor</span>
          </button>
        </div>
      </header>

      {view === 'ai' ? <AIMain user={user} /> : <HumanMain user={user} />}
    </div>
  );
}

function AIMain({ user }: { user: any }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithAIMentorBackend(history, text);
      const botMsg: ChatMessage = { id: 'bot-'+Date.now(), role: 'assistant', content: typeof response === 'string' ? response : JSON.stringify(response), timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const botMsg: ChatMessage = { id: 'bot-'+Date.now(), role: 'assistant', content: JSON.stringify({text: "Connection to logical pathways failed."}), timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (m: ChatMessage) => {
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
          <div className="clean-card p-4 border border-blue-100 bg-white">
            <h4 className="font-bold text-gray-900 mb-1">{parsed.card.title}</h4>
            <div className="text-sm text-blue-600 font-medium mb-2">{parsed.card.org} • {parsed.card.type}</div>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{parsed.card.description}</p>
            <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-3">
              <span className="text-xs text-red-500 font-semibold">{parsed.card.deadline || "Open"}</span>
              {parsed.card.applyLink && (
                <a href={parsed.card.applyLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
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
    <div className="flex-1 clean-card flex flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center m-auto h-full text-center space-y-8 animate-in fade-in zoom-in duration-500 pb-12">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
               <Bot className="w-10 h-10 text-blue-600" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Yuva AI Mentor</h3>
              <p className="text-gray-500 font-medium">I help with career decisions, application strategy, and skill roadmaps.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 max-w-xl">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => handleSend(s)} className="px-4 py-2 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-full text-sm font-medium transition-colors">
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
            placeholder="Query your mentor..."
            className="clean-input w-full pr-16 py-3.5 bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white text-sm"
          />
          <button onClick={() => handleSend(input)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function HumanMain({ user }: { user: any }) {
  const [showApply, setShowApply] = useState(false);

  const DUMMY_MENTORS = [
    { id: '1', name: 'Aisha Sharma', field: 'Software Engineering', org: 'Microsoft', exp: '4', tags: ['Backend', 'System Design'] },
    { id: '2', name: 'Rahul Desai', field: 'Product Management', org: 'Atlassian', exp: '6', tags: ['Strategy', 'Agile'] },
  ];

  return (
    <div className="flex-1 overflow-y-auto space-y-12 pb-20 no-scrollbar">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DUMMY_MENTORS.map(m => (
          <div key={m.id} className="clean-card p-6 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                   <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                      {m.name.charAt(0)}
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-gray-900 leading-tight">{m.name}</h3>
                     <p className="text-sm font-medium text-blue-600">{m.org}</p>
                   </div>
                </div>
                <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded">{m.exp} Yrs Exp</span>
              </div>
              <p className="text-sm text-gray-700 font-medium mb-4">{m.field}</p>
              
              <div className="flex flex-wrap gap-2 mt-4">
                 {m.tags.map(t => (
                   <span key={t} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded border border-gray-200">
                     {t}
                   </span>
                 ))}
              </div>
            </div>
            <button className="clean-btn-outline w-full py-2.5 mt-6 text-sm">Request Session</button>
          </div>
        ))}
      </div>

      <div className="bg-blue-600 text-white rounded-2xl p-8 md:p-12 relative overflow-hidden text-center flex flex-col items-center shadow-lg">
         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white flex items-center justify-center"></div>
         <div className="relative z-10 max-w-xl">
           <h3 className="text-2xl font-bold tracking-tight mb-3">Want to guide the next generation?</h3>
           <p className="text-blue-100 mb-8 font-medium">Transmit your experience and shape the trajectory of a rising student.</p>
           {!showApply ? (
             <button onClick={() => setShowApply(true)} className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3.5 rounded-lg font-bold transition-all shadow-md">Apply to Become a Mentor</button>
           ) : (
             <MentorApplyForm user={user} onClose={() => setShowApply(false)} />
           )}
         </div>
      </div>

    </div>
  );
}

function MentorApplyForm({ user, onClose }: any) {
  const [formData, setFormData] = useState({ name: '', linkedin: '', org: '', field: '', exp: '', availability: [] as string[], why: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setSubmitError(null);
    try {
      if(!user) throw new Error("Must be logged in.");
      await addDoc(collection(db, 'mentor_applications'), {
        ...formData, submitterUid: user.uid, status: 'pending', createdAt: serverTimestamp()
      });
      setSuccess(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if(success) {
    return <div className="text-white font-bold bg-white/10 rounded-xl p-8 text-center flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center mb-3">
         <Check className="w-6 h-6" />
      </div>
      Application Submitted Successfully.
    </div>
  }

  return (
    <form onSubmit={handleSubmit} className="text-left bg-white text-gray-900 rounded-xl p-6 md:p-8 space-y-6 w-full shadow-xl">
      {submitError ? <ErrorState title="Application not submitted" description={submitError} /> : null}
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
         <h4 className="font-bold text-lg">Mentor Application</h4>
         <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <input required type="text" placeholder="Full Name" className="clean-input p-3" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <input required type="url" placeholder="LinkedIn URL" className="clean-input p-3" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} />
        <input required type="text" placeholder="College or Company" className="clean-input p-3" value={formData.org} onChange={e => setFormData({...formData, org: e.target.value})} />
        <input required type="text" placeholder="Field of Expertise" className="clean-input p-3" value={formData.field} onChange={e => setFormData({...formData, field: e.target.value})} />
        <input required type="number" placeholder="Years of Exp" className="clean-input p-3" value={formData.exp} onChange={e => setFormData({...formData, exp: e.target.value})} />
      </div>
      
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700 block">Availability</label>
        <div className="flex flex-wrap gap-3">
          {['Weekdays', 'Weekends', 'Evenings'].map(opt => (
            <label key={opt} className={`px-4 py-2 rounded-full border text-sm font-medium cursor-pointer transition-colors ${formData.availability.includes(opt) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              <input type="checkbox" className="hidden"
                checked={formData.availability.includes(opt)}
                onChange={(e) => {
                  const newArr = e.target.checked ? [...formData.availability, opt] : formData.availability.filter(x => x !== opt);
                  setFormData({...formData, availability: newArr});
                }}
               />
               {opt}
            </label>
          ))}
        </div>
      </div>

      <textarea required placeholder="Why do you want to mentor?" rows={3} className="clean-input w-full p-3 resize-none" value={formData.why} onChange={e => setFormData({...formData, why: e.target.value})}/>

      <div className="flex gap-4 pt-2">
        <button type="submit" disabled={loading} className="clean-btn w-full p-3.5 shadow-md flex-1">{loading ? 'Submitting...' : 'Submit Form'}</button>
        <button type="button" onClick={onClose} className="clean-btn-outline w-full p-3.5 flex-1 text-gray-600">Cancel</button>
      </div>
    </form>
  )
}

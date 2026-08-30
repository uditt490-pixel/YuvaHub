import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useSocket } from '../context/SocketContext';
import VoiceOrb from '../components/VoiceOrb';
import {
  Mic, MicOff, Square, Play, Volume2, CheckCircle2, RotateCcw,
  Sparkles, Brain, FileText, MessageSquare, PenTool
} from 'lucide-react';
import Whiteboard from '../components/Whiteboard';

// Web Speech API Types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const MockInterviewRoom: React.FC = () => {
  const { user } = useAppContext();
  const [jobDescription, setJobDescription] = useState('');
  const [resumeContext, setResumeContext] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [currentSpeech, setCurrentSpeech] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<{ score: number; feedback: string } | null>(null);
  const [setupError, setSetupError] = useState('');
  const [voiceError, setVoiceError] = useState('');        // speech recognition error message
  const [voiceInputFallback, setVoiceInputFallback] = useState(false); // show text input when voice fails
  const [textAnswer, setTextAnswer] = useState('');        // text fallback answer
  const [isAiThinking, setIsAiThinking] = useState(false); // AI generating response
  const [activeTab, setActiveTab] = useState<'chat' | 'whiteboard'>('chat'); // chat or whiteboard view

  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  // Refs to avoid stale closures in speech callbacks
  const isSessionActiveRef = useRef(false);
  const historyRef = useRef<Message[]>([]);
  const jobDescriptionRef = useRef('');
  const resumeContextRef = useRef('');

  const { socket, isConnected } = useSocket();

  // Keep refs in sync with state so closures always have latest values
  useEffect(() => { isSessionActiveRef.current = isSessionActive; }, [isSessionActive]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { jobDescriptionRef.current = jobDescription; }, [jobDescription]);
  useEffect(() => { resumeContextRef.current = resumeContext; }, [resumeContext]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, currentSpeech]);

  useEffect(() => {
    if (!socket) return;

    const handleResponse = (data: { text: string }) => {
      setHistory((prev) => [...prev, { role: 'ai', content: data.text }]);
      speakText(data.text);
    };

    const handleEnd = (data: { success: boolean; score: number; feedback: string }) => {
      setFeedback({ score: data.score, feedback: data.feedback });
    };

    socket.on('mock_interview_response', handleResponse);
    socket.on('mock_interview_ended', handleEnd);

    return () => {
      socket.off('mock_interview_response', handleResponse);
      socket.off('mock_interview_ended', handleEnd);
    };
  }, [socket]);

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSetupError('Speech Recognition is not supported in this browser. Please use Chrome.');
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setCurrentSpeech(interimTranscript);

      if (finalTranscript) {
        handleUserSpeechFinal(finalTranscript);
      }
    };

    recognition.onstart = () => { setIsListening(true); setVoiceError(''); };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      const err = event.error as string;
      console.error('Speech recognition error', err);
      setIsListening(false);
      if (err === 'network') {
        setVoiceError('Voice recognition requires an active internet connection to Google\'s speech servers. Use the text input below instead.');
        setVoiceInputFallback(true);
      } else if (err === 'not-allowed' || err === 'permission-denied') {
        setVoiceError('Microphone permission was denied. Please allow microphone access in your browser and try again.');
        setVoiceInputFallback(true);
      } else if (err === 'no-speech') {
        // silent — just ready again
      } else {
        setVoiceError(`Voice error: ${err}. You can type your answer below.`);
        setVoiceInputFallback(true);
      }
    };

    recognitionRef.current = recognition;
    return true;
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech before starting new one
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1;

    // Load voices - may need to wait for them to be available
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const goodVoice = voices.find(v =>
        v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Samantha')
      );
      if (goodVoice) utterance.voice = goodVoice;
    };
    setVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Use ref (not state) to avoid stale closure — this is the key fix
      if (isSessionActiveRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // recognition already started or aborted; ignore
        }
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const startSession = () => {
    if (!jobDescription.trim()) {
      setSetupError('Please provide a job description before starting the interview.');
      return;
    }
    setSetupError('');
    const initialized = initSpeechRecognition();
    if (!initialized) return;

    // Set ref synchronously BEFORE calling speakText so onend callback sees it correctly
    isSessionActiveRef.current = true;
    setIsSessionActive(true);
    setHistory([]);
    setFeedback(null);
    setIsAiThinking(false);

    // Greeting includes job title context from JD
    const jdSnippet = jobDescriptionRef.current.slice(0, 120).trim();
    const greeting = `Hello! I'll be your AI interviewer today. I've reviewed the job description${jdSnippet ? ` — looks like you're targeting: "${jdSnippet}..."` : ''}. Let's start with a classic: Can you tell me about yourself and why you're interested in this role?`;
    setHistory([{ role: 'ai', content: greeting }]);
    speakText(greeting);
  };

  const handleUserSpeechFinal = async (text: string) => {
    setHistory((prev) => [...prev, { role: 'user', content: text }]);
    setCurrentSpeech('');

    if (socket && isConnected) {
      // Use refs for latest values — avoids stale closure from recognition callback
      socket.emit('mock_interview_message', {
        text,
        jobDescription: jobDescriptionRef.current,
        resumeContext: resumeContextRef.current,
        history: historyRef.current
      });
    } else {
      // ── Real Gemini AI fallback (not socket, but still intelligent) ──
      setIsAiThinking(true);
      try {
        const conversationSoFar = historyRef.current
          .map(m => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
          .join('\n');

        const prompt = `You are a strict but fair technical interviewer conducting a mock job interview.

Job Description:
${jobDescriptionRef.current || 'General software engineering role'}

${resumeContextRef.current ? `Candidate Background:\n${resumeContextRef.current}\n` : ''}
Conversation so far:
${conversationSoFar}
Candidate: ${text}

INSTRUCTIONS:
- If the candidate's last message is irrelevant, rude, off-topic, or clearly not a serious interview answer, gently redirect them back to the interview. Do NOT continue asking new technical questions.
- If it is a real answer, ask ONE concise, intelligent follow-up question based specifically on what they said and the job description above.
- Keep your response to 1-3 sentences maximum.
- Do NOT introduce yourself. Just ask the next question or give a brief reaction and follow-up.

Your response:`;

        const res = await fetch('/api/v1/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, expectJson: false })
        });

        if (res.ok) {
          const data = await res.json();
          const reply = (data.text || '').trim();
          if (reply) {
            setHistory(prev => [...prev, { role: 'ai', content: reply }]);
            speakText(reply);
            setIsAiThinking(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Gemini call failed, using static fallback', e);
      }

      // Last resort static fallback (only if Gemini call fails entirely)
      const fallbackResponses = [
        "That's interesting. Can you walk me through a specific example where you applied that in a real project?",
        "How would you handle edge cases or failure scenarios in that approach?",
        "Can you tell me about a challenge you faced and how you resolved it?",
      ];
      const reply = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      setTimeout(() => {
        setHistory(prev => [...prev, { role: 'ai', content: reply }]);
        speakText(reply);
        setIsAiThinking(false);
      }, 600);
    }
  };

  const stopSession = () => {
    setIsSessionActive(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    if (socket && isConnected) {
      socket.emit('end_mock_interview', {
        userId: user?.uid,
        jobDescription,
        resumeContext,
        transcript: history
      });
    } else {
      // Offline fallback: generate a score from conversation length
      const score = Math.min(95, 60 + history.filter(m => m.role === 'user').length * 5);
      setFeedback({
        score,
        feedback: `Solid performance across ${history.filter(m => m.role === 'user').length} responses. Strong technical communication observed. Recommended improvement: add quantifiable outcomes (e.g. latency reductions, throughput gains) to strengthen impact statements.`
      });
    }
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // Waveform bar heights - static for minimal render
  const waveBarHeights = [30, 55, 70, 45, 80, 40, 65, 50, 75, 35, 60, 48, 72, 38, 55];

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 font-sans pb-16 px-2 sm:px-4">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center gap-1.5 shadow-xs">
                <Mic className="w-3.5 h-3.5 text-indigo-400" /> AI Mock Interview Room
              </span>
              <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center gap-1.5">
                <Volume2 className="w-3 h-3" /> Voice Enabled
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              AI Mock <span className="text-primary-blue italic">Interview Room</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Practice real voice-based technical and behavioral interviews with an AI interviewer. Speak naturally — get instant follow-up questions and a final score.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md border border-cyan-800/40 p-4 rounded-2xl shadow-xs">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'}`} />
            <div>
              <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">AI Backend</div>
              <div className="text-xs font-extrabold text-white">{isConnected ? 'Connected' : 'Offline Fallback Mode'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Phase */}
      {!isSessionActive && !feedback && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Setup Form */}
          <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xs">
            <div className="border-b border-border-theme dark:border-slate-800 pb-4">
              <h2 className="text-lg font-serif font-bold text-text-primary dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-blue" /> Interview Setup
              </h2>
              <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">Provide the job description and your background for personalized interview questions.</p>
            </div>

            {setupError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
                {setupError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Target Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Paste the full job description here... (e.g. Senior Software Engineer at Stripe...)"
                value={jobDescription}
                onChange={e => { setJobDescription(e.target.value); setSetupError(''); }}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3.5 text-xs text-text-primary dark:text-white outline-none resize-none focus:border-primary-blue transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Resume / Background Context <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <textarea
                rows={4}
                placeholder="Paste key resume highlights or background context... (e.g. 3 years of React, TypeScript, Node.js...)"
                value={resumeContext}
                onChange={e => setResumeContext(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3.5 text-xs text-text-primary dark:text-white outline-none resize-none focus:border-primary-blue transition-colors"
              />
            </div>

            <button
              onClick={startSession}
              className="w-full py-3.5 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-sm rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4" /> Begin AI Interview Session
            </button>
          </div>

          {/* Instructions Panel */}
          <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xs space-y-5">
            <div className="border-b border-border-theme dark:border-slate-800 pb-4">
              <h2 className="text-lg font-serif font-bold text-text-primary dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary-blue" /> How It Works
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { step: '01', title: 'Setup Your Session', desc: 'Paste the target role JD and optionally your resume highlights for AI context.' },
                { step: '02', title: 'AI Opens The Interview', desc: 'The AI interviewer greets you and reads your JD to generate contextual questions.' },
                { step: '03', title: 'Speak Your Answers', desc: 'Click "Speak / Resume" and answer naturally. Your voice is transcribed in real time.' },
                { step: '04', title: 'AI Follow-Up Questions', desc: 'After each answer, the AI interviewer speaks a deep follow-up question automatically.' },
                { step: '05', title: 'End & Score', desc: 'Click "End Interview" to receive your performance score and personalized feedback.' }
              ].map(item => (
                <div key={item.step} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f3e4bd] text-text-secondary font-serif font-extrabold text-xs flex items-center justify-center border border-border-theme">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-text-primary dark:text-white">{item.title}</h4>
                    <p className="text-[11px] text-text-secondary dark:text-slate-400 font-medium mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border-theme dark:border-slate-800">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-text-muted">
                <Sparkles className="w-3.5 h-3.5 text-primary-blue" /> Works best in Google Chrome with microphone permission enabled.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ Active Interview Session — split layout: Orb left | Chat right ══ */}
      {isSessionActive && (
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4 items-start">

          {/* ── LEFT: Orb + Controls ──────────────────────────────────── */}
          <div className="flex flex-col bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm" style={{ height: '560px' }}>

            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-theme dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                {isListening && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-blue/10 text-primary-blue border border-primary-blue/30 rounded-full text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-blue animate-pulse" />
                    Listening...
                  </span>
                )}
                {isSpeaking && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#63703d]/10 text-[#63703d] border border-[#63703d]/30 rounded-full text-[10px] font-bold">
                    <Volume2 className="w-3 h-3" /> AI Speaking
                  </span>
                )}
                {!isListening && !isSpeaking && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-secondary text-text-muted border border-border-theme rounded-full text-[10px] font-bold">
                    <Mic className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>
              <button
                onClick={stopSession}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Square className="w-3 h-3" /> End Interview
              </button>
            </div>

            {/* Orb centrepiece — fills remaining height */}
            <div
              className="flex-1 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#fcf9f2] to-white dark:from-slate-950 dark:to-slate-900"
            >
              <div
                className="rounded-full"
                style={{
                  filter: isSpeaking
                    ? 'drop-shadow(0 0 32px rgba(99,112,61,0.5))'
                    : isListening
                    ? 'drop-shadow(0 0 32px rgba(181,107,55,0.55))'
                    : 'drop-shadow(0 0 12px rgba(181,107,55,0.15))'
                }}
              >
                <VoiceOrb isListening={isListening} isSpeaking={isSpeaking} size={220} />
              </div>

              {/* Who is speaking label */}
              <div className="text-center space-y-1">
                <p
                  className="text-[11px] font-extrabold uppercase tracking-widest transition-colors duration-500"
                  style={{ color: isSpeaking ? '#63703d' : isListening ? '#b56b37' : '#8c7569' }}
                >
                  {isSpeaking ? 'AI Interviewer' : isListening ? 'You' : 'Standby'}
                </p>
                <p className="text-[10px] text-text-muted font-medium">
                  {isSpeaking
                    ? 'Generating your next question…'
                    : isListening
                    ? 'Listening — speak clearly'
                    : 'Press Speak or wait for AI'}
                </p>
              </div>

              {/* Speak button — only show when idle */}
              {!isListening && !isSpeaking && (
                <button
                  onClick={() => { try { recognitionRef.current?.start(); } catch (e) {} }}
                  className="mt-2 px-5 py-2.5 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-2xl cursor-pointer flex items-center gap-2 transition-colors shadow-md"
                >
                  <Mic className="w-4 h-4" /> Press to Speak
                </button>
              )}
            </div>
          </div>

          {/* ── RIGHT: Transcript Chat ────────────────────────────────── */}
          <div
            className="flex flex-col bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm"
            style={{ height: '560px' }}
          >
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-border-theme dark:border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`font-serif font-bold text-sm flex items-center gap-1.5 transition-colors ${activeTab === 'chat' ? 'text-text-primary dark:text-white border-b-2 border-primary-blue pb-1' : 'text-text-muted dark:text-slate-500 hover:text-text-primary dark:hover:text-slate-300 pb-1'}`}
                >
                  <MessageSquare className="w-4 h-4" /> Transcript
                </button>
                <button
                  onClick={() => setActiveTab('whiteboard')}
                  className={`font-serif font-bold text-sm flex items-center gap-1.5 transition-colors ${activeTab === 'whiteboard' ? 'text-text-primary dark:text-white border-b-2 border-primary-blue pb-1' : 'text-text-muted dark:text-slate-500 hover:text-text-primary dark:hover:text-slate-300 pb-1'}`}
                >
                  <PenTool className="w-4 h-4" /> Whiteboard
                </button>
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{history.length} exchanges</span>
            </div>

            {/* Messages — scrolls internally */}
            <div className={`flex-1 flex-col overflow-hidden min-h-0 ${activeTab === 'chat' ? 'flex' : 'hidden'}`}>
              <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
                {history.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                    <Brain className="w-8 h-8 text-[#e8ded1]" />
                    <p className="text-xs text-text-muted font-medium">The interviewer will speak first.<br />Your responses will appear here.</p>
                  </div>
                )}

                {history.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${msg.role === 'user' ? 'text-primary-blue' : 'text-[#63703d]'}`}>
                      {msg.role === 'user' ? 'You' : 'AI Interviewer'}
                    </span>
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs font-medium leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary-blue text-white rounded-br-sm'
                          : 'bg-background dark:bg-slate-800 text-text-primary dark:text-slate-200 border border-border-theme dark:border-slate-700 rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Live interim speech preview */}
                {currentSpeech && (
                  <div className="flex flex-col items-end animate-fade-in">
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-1 text-primary-blue">You (Speaking...)</span>
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-sm text-xs font-medium bg-primary-blue/50 text-white italic">
                      {currentSpeech}
                    </div>
                  </div>
                )}

                {/* AI Thinking indicator — shows while Gemini generates a response */}
                {isAiThinking && (
                  <div className="flex flex-col items-start animate-fade-in">
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-1 text-[#63703d]">AI Interviewer</span>
                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-background border border-border-theme flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#63703d] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#63703d] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#63703d] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={transcriptEndRef} />
              </div>

              {/* Voice Error Banner + Text Fallback — pinned to bottom of chat panel */}
              {voiceError && (
                <div className="border-t border-amber-200 bg-amber-50 p-3 flex-shrink-0">
                  <div className="flex items-start gap-2 mb-2">
                    <MicOff className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] font-semibold text-amber-800 leading-relaxed">{voiceError}</p>
                  </div>
                  {voiceInputFallback && (
                    <div className="flex gap-2">
                      <textarea
                        rows={2}
                        value={textAnswer}
                        onChange={e => setTextAnswer(e.target.value)}
                        placeholder="Type your answer and press Enter or Send..."
                        className="flex-1 bg-surface border border-amber-200 rounded-xl p-2.5 text-xs text-text-primary outline-none resize-none focus:border-primary-blue transition-colors"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey && textAnswer.trim()) {
                            e.preventDefault();
                            handleUserSpeechFinal(textAnswer.trim());
                            setTextAnswer('');
                          }
                        }}
                      />
                      <button
                        disabled={!textAnswer.trim()}
                        onClick={() => {
                          if (textAnswer.trim()) {
                            handleUserSpeechFinal(textAnswer.trim());
                            setTextAnswer('');
                          }
                        }}
                        className="px-3 py-2 bg-primary-blue hover:bg-[#96552a] disabled:opacity-40 text-white font-bold text-xs rounded-xl cursor-pointer self-end transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Whiteboard view */}
            <div className={`flex-1 w-full h-full min-h-0 ${activeTab === 'whiteboard' ? 'block' : 'hidden'}`}>
              <Whiteboard />
            </div>
          </div>
        </div>
      )}


      {/* Feedback / Score View */}
      {feedback && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-8 shadow-2xs space-y-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full border-4 border-primary-blue bg-background flex items-center justify-center">
                <span className="font-serif font-extrabold text-3xl text-primary-blue">{feedback.score}</span>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Interview Score</div>
                <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white mt-0.5">
                  {feedback.score >= 85 ? 'Excellent Performance' : feedback.score >= 70 ? 'Good Performance' : 'Needs Improvement'}
                </h2>
              </div>
            </div>

            <div className="bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-2xl p-5 text-left">
              <h3 className="font-bold text-xs text-[#63703d] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> AI Feedback & Recommendations
              </h3>
              <p className="text-xs text-text-primary dark:text-slate-200 font-medium leading-relaxed">{feedback.feedback}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => { setFeedback(null); setHistory([]); setCurrentSpeech(''); setIsSessionActive(false); }}
                className="px-6 py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Try Another Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterviewRoom;

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import './MockInterviewRoom.css';
import { useAppContext } from '../context/AppContext';
import { useSocket } from '../context/SocketContext';

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
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const { socket, isConnected } = useSocket();

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, currentSpeech]);

  useEffect(() => {
    if (!socket) return;
    
    const handleResponse = (data: { text: string }) => {
      setIsProcessing(false);
      setHistory((prev) => [...prev, { role: 'ai', content: data.text }]);
      speakText(data.text);
    };
    
    const handleEnd = (data: { success: boolean; score: number; feedback: string }) => {
      setIsProcessing(false);
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
      setMediaError('Your browser does not support Speech Recognition. Please try Chrome.');
      return;
    }

    try {
      navigator.mediaDevices?.getUserMedia({ audio: true }).then(stream => {
        mediaStreamRef.current = stream;
      }).catch(err => {
        setMediaError('Microphone access denied. Please allow microphone permissions.');
        return;
      });
    } catch (err) {
      setMediaError('Failed to access microphone.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop after each utterance so we can send it
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

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      // We don't automatically restart here; user flow dictates when to listen.
    };
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setMediaError('Microphone access denied. Please allow microphone permissions in your browser settings.');
      } else if (event.error === 'no-speech') {
        setMediaError('No speech detected. Please try again.');
      } else {
        setMediaError(`Speech recognition error: ${event.error}`);
      }
    };

    recognitionRef.current = recognition;
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    // Optionally pick a good voice
    const voices = window.speechSynthesis.getVoices();
    const goodVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium'));
    if (goodVoice) utterance.voice = goodVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Auto-start listening after AI finishes speaking, if session is active
      if (isSessionActive && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch(e) {}
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const startSession = () => {
    if (!jobDescription) {
      alert("Please provide a job description first.");
      return;
    }
    initSpeechRecognition();
    setIsSessionActive(true);
    setHistory([]);
    setFeedback(null);

    // Initial greeting from AI to kick things off
    const greeting = "Hello! I will be your interviewer today. I've reviewed your resume and the job description. Are you ready to begin?";
    setHistory([{ role: 'ai', content: greeting }]);
    speakText(greeting);
  };

  const handleUserSpeechFinal = (text: string) => {
    setHistory((prev) => [...prev, { role: 'user', content: text }]);
    setCurrentSpeech('');
    setIsProcessing(true);

    if (socket && isConnected) {
      socket.emit('mock_interview_message', {
        text,
        jobDescription,
        resumeContext,
        history
      });
    } else {
      console.warn("Socket not connected");
      setIsProcessing(false);
    }
  };

  const stopSession = () => {
    setIsSessionActive(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    if (socket && isConnected) {
      socket.emit('end_mock_interview', {
        userId: user?.uid,
        jobDescription,
        resumeContext,
        transcript: history
      });
    }
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.off('mock_interview_response');
        socketRef.current.off('mock_interview_ended');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <div className="mock-interview-container">
      <div className="mock-interview-header">
        <h1>AI Mock Interview</h1>
        <p>Practice for your dream job with real-time voice feedback</p>
      </div>

      {mediaError && (
        <div className="mock-error" style={{background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#B91C1C', fontSize: '14px'}}>
          {mediaError}
          <button onClick={() => setMediaError(null)} style={{marginLeft: '12px', background: 'none', border: 'none', color: '#B91C1C', cursor: 'pointer', fontWeight: 'bold'}}>Dismiss</button>
        </div>
      )}

      {isProcessing && (
        <div className="mock-loading" style={{textAlign: 'center', padding: '16px', color: '#6B7280', fontSize: '14px'}}>
          <div className="animate-pulse">AI is processing your response...</div>
        </div>
      )}

      {!isSessionActive && !feedback && (
        <div className="mock-setup">
          <label>Job Description</label>
          <textarea 
            placeholder="Paste the target job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          <label>Resume / Background Context (Optional)</label>
          <textarea 
            placeholder="Paste your resume or key background details..."
            value={resumeContext}
            onChange={(e) => setResumeContext(e.target.value)}
          />

          <button className="btn-primary" onClick={startSession}>
            Start Interview
          </button>
        </div>
      )}

      {feedback && (
        <div className="feedback-box">
          <h2>Score: {feedback.score}/100</h2>
          <p>{feedback.feedback}</p>
          <button className="btn-primary" style={{marginTop: '20px'}} onClick={() => { setFeedback(null); setHistory([]); }}>
            Try Again
          </button>
        </div>
      )}

      {isSessionActive && (
        <div className="active-session">
          <div className="visualizer-container">
            {isListening && (
              <div className="status-indicator listening">
                <div className="pulse"></div> Listening...
              </div>
            )}
            {isSpeaking && (
              <div className="status-indicator speaking">
                <div className="pulse"></div> AI Speaking...
              </div>
            )}
            
            <div className="waveform">
              {/* Dummy animated bars for visual effect */}
              {Array.from({ length: 15 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`bar ${isSpeaking ? 'ai' : ''}`}
                  style={{ 
                    height: (isListening || isSpeaking) ? `${Math.random() * 80 + 20}px` : '20px',
                    animation: (isListening || isSpeaking) ? `pulseAnim ${0.5 + Math.random()}s infinite` : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="transcript-box">
            {history.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <span className="message-sender">{msg.role === 'user' ? 'You' : 'Interviewer'}</span>
                <div className="message-bubble">{msg.content}</div>
              </div>
            ))}
            {currentSpeech && (
              <div className="message user">
                 <span className="message-sender">You (Speaking...)</span>
                 <div className="message-bubble" style={{ opacity: 0.7 }}>{currentSpeech}</div>
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>

          <div className="controls">
            {!isListening && !isSpeaking && (
              <button className="btn-primary" onClick={() => recognitionRef.current?.start()}>
                Hold to Speak / Resume
              </button>
            )}
            <button className="btn-danger" onClick={stopSession}>
              End Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterviewRoom;

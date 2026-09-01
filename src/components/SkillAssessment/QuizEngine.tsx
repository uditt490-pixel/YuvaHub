import React, { useEffect, useState, useCallback } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Award,
  Send,
  RotateCcw,
} from 'lucide-react';
import { QuizQuestion, QuizResult } from '../../types';
import { apiFetch } from '../../lib/apiFetch';

interface QuizEngineProps {
  skill: string;
  questions: QuizQuestion[];
  quizDurationSeconds?: number;
  onAutoSubmit?: () => void;
  onComplete?: (result: QuizResult) => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  skill,
  questions,
  quizDurationSeconds = 600,
  onAutoSubmit,
  onComplete,
}) => {
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(quizDurationSeconds);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Submit Handler
  const submitQuiz = useCallback(async () => {
    if (isSubmitting || quizResult) return;
    setIsSubmitting(true);

    const answersArray = questions.map((q) => ({
      questionId: q.id,
      selectedOptionIndex: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
    }));

    try {
      const res = await apiFetch('/api/v1/skills/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill,
          questions,
          answers: answersArray,
        }),
      });

      if (res) {
        const result: QuizResult = {
          passed: Boolean(res.passed),
          scorePercent: res.scorePercent || 0,
          correctCount: res.correctCount || 0,
          totalQuestions: res.totalQuestions || questions.length,
          badgeAwarded: Boolean(res.badgeAwarded),
          message: res.message || '',
        };
        setQuizResult(result);
        if (onComplete) onComplete(result);
      }
    } catch (err) {
      console.warn('API quiz evaluation fallback:', err);
      let correct = 0;
      questions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctOptionIndex) correct += 1;
      });
      const pct = Math.round((correct / (questions.length || 1)) * 100);
      const passed = pct >= 80;
      const result: QuizResult = {
        passed,
        scorePercent: pct,
        correctCount: correct,
        totalQuestions: questions.length,
        badgeAwarded: passed,
        message: passed
          ? `Congratulations! You scored ${pct}%. Verified ${skill} badge awarded.`
          : `You scored ${pct}%. Minimum 80% score required for a Verified badge.`,
      };
      setQuizResult(result);
      if (onComplete) onComplete(result);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, quizResult, questions, selectedAnswers, skill, onComplete]);

  const handleAutoSubmit = useCallback(() => {
    if (onAutoSubmit) onAutoSubmit();
    void submitQuiz();
  }, [onAutoSubmit, submitQuiz]);

  // Anti-Cheat: Visibility Change & Copy-Paste Event Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !quizResult) {
        setTabSwitchCount((prev) => {
          const updated = prev + 1;
          if (updated >= 3) {
            alert('Quiz terminated automatically due to repeated tab switching.');
            handleAutoSubmit();
          } else {
            alert(`Warning: Tab switching is monitored. Departure ${updated}/3`);
          }
          return updated;
        });
      }
    };

    const handleCopyPaste = (e: Event) => {
      e.preventDefault();
      alert('Copy-pasting code or prompts is disabled during validation testing.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, [handleAutoSubmit, quizResult]);

  // Countdown Timer
  useEffect(() => {
    if (quizResult || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizResult, handleAutoSubmit]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestionIndex];

  if (!currentQ && !quizResult) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-3xl border border-slate-800">
        Loading quiz assessment questions...
      </div>
    );
  }

  return (
    <div className="quiz-container max-w-3xl mx-auto p-6 md:p-8 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Automated Skill Verification
          </div>
          <h2 className="text-xl font-black text-white mt-0.5">{skill} Verification Assessment</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-amber-400 font-black text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <span className="text-xs font-bold text-slate-400">
            {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
      </div>

      {/* Tab switch warning alert */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>⚠️ Tab switches detected: <strong>{tabSwitchCount} / 3</strong></span>
        </div>
        <span className="text-[10px] text-amber-400/80 uppercase tracking-wider font-semibold">Anti-Cheat Active</span>
      </div>

      {/* Quiz Question Box */}
      {!quizResult && currentQ && (
        <div className="space-y-6 pt-2">
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
              Question {currentQuestionIndex + 1}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          <div className="space-y-3">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQ.id] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() =>
                    setSelectedAnswers((prev) => ({
                      ...prev,
                      [currentQ.id]: optIdx,
                    }))
                  }
                  className={`w-full p-4 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center border ${
                        isSelected
                          ? 'bg-indigo-500 border-indigo-400 text-slate-950'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={submitQuiz}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-lg"
              >
                <Send className="w-4 h-4 fill-current" /> {isSubmitting ? 'Evaluating...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Modal / Banner */}
      {quizResult && (
        <div className="p-6 md:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center border-4 shadow-xl font-black text-2xl"
               style={{
                 borderColor: quizResult.passed ? '#10b981' : '#f59e0b',
                 backgroundColor: quizResult.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                 color: quizResult.passed ? '#10b981' : '#f59e0b',
               }}>
            {quizResult.passed ? <Award className="w-8 h-8 text-emerald-400" /> : <AlertTriangle className="w-8 h-8 text-amber-400" />}
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">
              {quizResult.passed ? 'Skill Verification Passed!' : 'Assessment Complete'}
            </h3>
            <p className="text-sm text-slate-300 font-medium max-w-md mx-auto leading-relaxed">
              {quizResult.message}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Score</span>
              <span className="text-lg font-black text-emerald-400">{quizResult.scorePercent}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Correct</span>
              <span className="text-lg font-black text-white">{quizResult.correctCount} / {quizResult.totalQuestions}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Verified Badge</span>
              <span className={`text-lg font-black ${quizResult.badgeAwarded ? 'text-emerald-400' : 'text-slate-500'}`}>
                {quizResult.badgeAwarded ? 'AWARDED' : 'NOT MET'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

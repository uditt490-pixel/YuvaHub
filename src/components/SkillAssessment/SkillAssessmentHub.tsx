import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Play,
  RotateCcw,
  BookOpen,
  Code,
  Terminal,
  Cpu,
  Layers,
  Clock,
  Lock,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { QuizEngine } from './QuizEngine';
import { QuizQuestion, QuizResult } from '../../types';
import { apiFetch } from '../../lib/apiFetch';

export default function SkillAssessmentHub() {
  const { user, profile, updateProfile } = useAppContext();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [lastQuizResult, setLastQuizResult] = useState<QuizResult | null>(null);

  const availableSkills = [
    {
      name: 'React',
      category: 'Frontend Engineering',
      duration: '10 mins',
      questionsCount: 10,
      icon: Code,
      description: 'Hooks, Concurrent Mode, Virtual DOM reconciliation, state management, and RSC.',
    },
    {
      name: 'Node',
      category: 'Backend Systems',
      duration: '10 mins',
      questionsCount: 10,
      icon: Terminal,
      description: 'Event Loop, libuv, Stream backpressure, Cluster worker threads, and AsyncLocalStorage.',
    },
    {
      name: 'Python',
      category: 'Software & AI/ML',
      duration: '10 mins',
      questionsCount: 10,
      icon: Cpu,
      description: 'CPython GIL, Asyncio coroutines, Decorators, Generators, and Garbage Collection.',
    },
  ];

  const verifiedSkills = profile?.verified_skills || profile?.verifiedSkills || [];

  const handleStartQuiz = async (skillName: string) => {
    setSelectedSkill(skillName);
    setLoadingQuestions(true);
    setLastQuizResult(null);

    try {
      const res = await apiFetch(`/api/v1/skills/quiz/generate?skill=${encodeURIComponent(skillName)}`);
      if (res && res.fullQuestions && res.fullQuestions.length > 0) {
        setActiveQuizQuestions(res.fullQuestions);
      } else if (res && res.questions) {
        setActiveQuizQuestions(res.questions);
      }
    } catch (err) {
      console.warn('API quiz generation fallback', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleQuizComplete = (result: QuizResult) => {
    setLastQuizResult(result);
    if (result.passed && selectedSkill && updateProfile) {
      const currentVerified = profile?.verified_skills || profile?.verifiedSkills || [];
      if (!currentVerified.includes(selectedSkill)) {
        const updated = [...currentVerified, selectedSkill];
        updateProfile({
          verified_skills: updated,
          verifiedSkills: updated,
        });
      }
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Automated Skill Verification Suite
              </span>
              <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                Score &gt; 80% to Earn Verified Badge
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Automated Skill Assessments & <span className="text-indigo-400 italic">Verified Badges</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium leading-relaxed">
              Take timed technical assessments with anti-cheat detection. Earn verified skill badges displayed on your public profile and candidate recruiter search results.
            </p>
          </div>

          {/* Earned Badges Counter */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl w-full lg:w-auto shadow-inner">
            <div className="w-14 h-14 rounded-full border-4 border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-xl">
              {verifiedSkills.length}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your Verified Skill Badges</div>
              <div className="text-xs font-extrabold text-white">
                {verifiedSkills.length > 0 ? verifiedSkills.join(', ') : 'No Verified Badges Yet'}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                🔒 Displayed on Recruiter Searches
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Quiz Engine Execution View */}
      {selectedSkill && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedSkill(null);
                setActiveQuizQuestions([]);
                setLastQuizResult(null);
              }}
              className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl cursor-pointer"
            >
              ← Back to Assessment Catalog
            </button>

            {lastQuizResult && (
              <button
                onClick={() => handleStartQuiz(selectedSkill)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake {selectedSkill} Quiz
              </button>
            )}
          </div>

          {loadingQuestions ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-3xl border border-slate-800 text-xs">
              Generating dynamic question pool via AI...
            </div>
          ) : (
            <QuizEngine
              skill={selectedSkill}
              questions={activeQuizQuestions}
              onComplete={handleQuizComplete}
            />
          )}
        </div>
      )}

      {/* Assessment Catalog Grid */}
      {!selectedSkill && (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Available Skill Verification Tests
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableSkills.map((sk) => {
              const IconComp = sk.icon;
              const isVerified = verifiedSkills.includes(sk.name);

              return (
                <div
                  key={sk.name}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 hover:border-indigo-500/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-md">
                        <IconComp className="w-6 h-6" />
                      </div>

                      {isVerified ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-950 border border-slate-800 text-slate-400">
                          {sk.category}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-extrabold text-lg text-white">{sk.name} Assessment</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                        {sk.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-2 border-t border-slate-800">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> {sk.duration}
                      </span>
                      <span>10 Questions</span>
                      <span>Pass: &gt; 80%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartQuiz(sk.name)}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" /> {isVerified ? 'Retake Verification Test' : `Start ${sk.name} Quiz`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

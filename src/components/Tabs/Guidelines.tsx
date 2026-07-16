import React, { useState } from 'react';
import { BookOpen, Shield, ShieldAlert, Heart, Star, Send, CheckCircle2, Award, ChevronDown, ChevronUp, AlertTriangle, Eye, HelpCircle, XCircle, Info, MessageSquare, Scale } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

type GuidelineSection = 'conduct' | 'rules' | 'matrix' | 'disputes' | 'quiz';

interface RuleItem {
  id: string;
  category: string;
  title: string;
  description: string;
  dos: string[];
  donts: string[];
}

export default function Guidelines() {
  const { theme } = useAppContext();
  const [activeTab, setActiveTab] = useState<GuidelineSection>('conduct');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Interactive safety quiz states
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [badgeClaimed, setBadgeClaimed] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const quizQuestions = [
    {
      id: 1,
      question: 'A mentor asks for your personal phone number and direct banking details to "process an internship application". What do you do?',
      options: [
        'Provide the information immediately to secure the role.',
        'Refuse politely and continue the chat.',
        'Refuse to share private contact details, stop communication, and report the mentor profile immediately using the platform tools.'
      ],
      correct: 2
    },
    {
      id: 2,
      question: 'You want to post a solution to an ongoing university exam or coursework assignment on the community boards. Is this allowed?',
      options: [
        'Yes, sharing knowledge is encouraged on YuvaHub.',
        'No. Academic dishonesty is strictly prohibited. You can discuss general concepts but never share actual exam leaks, keys, or direct answers.',
        'Yes, as long as you add a disclaimer.'
      ],
      correct: 1
    },
    {
      id: 3,
      question: 'How many pending connection requests can you send to mentors at one time?',
      options: [
        'Unlimited, to maximize connection chances.',
        'Exactly 3 active pending requests, to prevent mentor inbox spamming.',
        'Up to 10 requests per day.'
      ],
      correct: 1
    },
    {
      id: 4,
      question: 'Under what circumstances can a user share promotional or affiliate links on the discussion board?',
      options: [
        'Whenever they feel like helping others buy a product.',
        'Under no circumstances. Commercial spam and affiliate sales are strictly forbidden.',
        'Only if the link is relevant to career advice.'
      ],
      correct: 1
    }
  ];

  const handleOptionSelect = (qId: number, optIdx: number) => {
    if (showResults) return;
    setAnswers(prev => ({
      ...prev,
      [qId]: optIdx
    }));
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let score = 0;
    quizQuestions.forEach(q => {
      if (answers[q.id] === q.correct) {
        score += 1;
      }
    });
    setQuizScore(score);
    setShowResults(true);
    if (score === quizQuestions.length) {
      setQuizSubmitted(true);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setShowResults(false);
    setQuizScore(0);
    setQuizSubmitted(false);
    setBadgeClaimed(false);
  };

  const ruleItems: RuleItem[] = [
    {
      id: 'rule-1',
      category: 'conduct',
      title: 'Professionalism & Respectful Communication',
      description: 'YuvaHub is a professional development platform. All communication in mentorship messages, connection requests, and discussion boards must remain respectful, constructive, and free of harassment.',
      dos: [
        'Use polite, professional salutations when contacting mentors.',
        'Provide constructive, objective feedback in discussion threads.',
        'Respect scheduling boundaries and respond to messages within a reasonable time.'
      ],
      donts: [
        'Do not send spam connection requests or aggressive follow-up notes.',
        'Do not use offensive, profane, discriminatory, or sexually suggestive language.',
        'Do not threaten or harass any member of the community.'
      ]
    },
    {
      id: 'rule-2',
      category: 'conduct',
      title: 'Academic Integrity & Honesty',
      description: 'We believe in true skill growth. Academic fraud, homework cheating, or plagiarism undermines the community values and will not be tolerated.',
      dos: [
        'Discuss general algorithms, study methodologies, and project designs.',
        'Credit source code libraries and templates used in your showcase portfolios.',
        'Share resources that help others understand complex engineering topics.'
      ],
      donts: [
        'Do not post direct exam leaks, active class answers, or test keys.',
        'Do not request mentors or students to write your academic papers or solve assignments for you.',
        'Do not plagiarize project submissions in opportunities boards.'
      ]
    },
    {
      id: 'rule-3',
      category: 'rules',
      title: 'No Commercial Advertising or Spam',
      description: 'YuvaHub is a non-profit, student-centric portal. Do not use the community feeds or private messaging channels to advertise external services, commercial products, or direct sales.',
      dos: [
        'Share free educational tools, open-source repos, and free bootcamps.',
        'List verified, zero-cost hackathons and scholarships.',
        'Promote community events that are free and open to everyone.'
      ],
      donts: [
        'Do not post affiliate links, paid referral codes, or product advertisements.',
        'Do not advertise commercial tutoring services or paid resume-writing bootcamps.',
        'Do not spam the opportunities list with duplicate entries.'
      ]
    },
    {
      id: 'rule-4',
      category: 'rules',
      title: 'Safety, Privacy & Contact Details sharing',
      description: 'To protect student privacy, do not post personal identifiers, addresses, or private contact coordinates in public community areas.',
      dos: [
        'Keep initial connection discussions on YuvaHub secure channels.',
        'Use official booking mechanisms (like Calendly/Google Meet links provided in mentor cards).',
        'Report users who demand instant messaging numbers or off-platform communication early.'
      ],
      donts: [
        'Do not post your personal phone numbers, home addresses, or personal social IDs on public boards.',
        'Do not share or request banking details, credit card numbers, or passwords under any pretext.',
        'Do not share other members\' private chats or personal details without permission.'
      ]
    },
    {
      id: 'rule-5',
      category: 'conduct',
      title: 'Mentor Code of Professional Ethics',
      description: 'Mentors are expected to represent industry excellence and hold high standards of mentorship leadership when working with student connections.',
      dos: [
        'Offer objective resume criticism and suggest real industry roadmaps.',
        'Inform the student in advance if you need to reschedule or cancel a session.',
        'Guide the student based on current industry standards and technical stack demands.'
      ],
      donts: [
        'Do not promise guaranteed placement or job success in exchange for personal favors or rewards.',
        'Do not use your mentorship status to exploit students or solicit unpaid work for your projects.',
        'Do not impose personal beliefs or unrelated non-technical discussions during mentorship sessions.'
      ]
    },
    {
      id: 'rule-6',
      category: 'rules',
      title: 'Platform Anti-Cheating & AI Usage Policies',
      description: 'While we encourage utilizing AI tools (like YuvaHub\'s integrated AI Assistant) for education, submitting pure copy-pasted AI content as original work in competitions or reviews is prohibited.',
      dos: [
        'Use AI tools to debug errors, summarize documentation, or brainstorm outline topics.',
        'Refactor and understand generated concepts, coding them by hand to prove mastery.',
        'Disclose if submission drafts were enhanced by generative assistance.'
      ],
      donts: [
        'Do not submit raw, unedited AI output as original code for contests or profile showcases.',
        'Do not post automatic, low-quality generated comments in discussion boards to inflate profile ratings.',
        'Do not use automated script queries to mass-apply to indexed opportunities.'
      ]
    }
  ];

  const penalties = [
    { violation: 'Spamming or duplicate listings', warning: '1st offense: Warning', action: '2nd offense: 3-day account suspension', severe: '3rd offense: Permanent ban' },
    { violation: 'Academic plagiarism / cheating', warning: '1st offense: Warning & post deletion', action: '2nd offense: 14-day account suspension', severe: '3rd offense: Permanent ban' },
    { violation: 'Unprofessional / rude behavior', warning: '1st offense: Warning', action: '2nd offense: 7-day account lock', severe: '3rd offense: Permanent ban' },
    { violation: 'Financial fraud, scam, or abusive harassment', warning: 'No warning', action: 'Immediate account lock & review', severe: 'Permanent IP & account ban' },
    { violation: 'Impersonating recruiters or administrators', warning: 'No warning', action: 'Immediate account termination', severe: 'Legal review & IP ban' },
    { violation: 'Bypassing connection request limits', warning: '1st offense: Action warning', action: '2nd offense: Connection feature suspension', severe: '3rd offense: Permanent ban' }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Guidelines Header Banner */}
      <div className="text-center py-10 mb-8 border-b border-gray-100 dark:border-gray-800 relative">
        {badgeClaimed && (
          <div className="absolute top-4 right-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl px-4 py-2 flex items-center gap-2 text-green-700 dark:text-green-400 animate-bounce">
            <Award className="w-5 h-5 text-green-500 fill-current" />
            <span className="text-xs font-bold">Pledged Safe Member</span>
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-3">
          <Shield className="w-10 h-10 text-blue-600 dark:text-blue-500" />
          Community Guidelines & Safety Code
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
          Our guidelines help ensure a safe, respectful, and productive mentorship environment for students and advisors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-450 dark:text-gray-500 mb-2 pl-2">
            Index
          </h3>
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 scrollbar-none">
            {[
              { id: 'conduct', label: 'Code of Conduct', icon: Heart },
              { id: 'rules', label: 'Platform Rules', icon: BookOpen },
              { id: 'matrix', label: 'Penalty Matrix', icon: ShieldAlert },
              { id: 'disputes', label: 'Disputes & Appeals', icon: Scale },
              { id: 'quiz', label: 'Safety Quiz & Pledge', icon: Award }
            ].map((sect) => {
              const Icon = sect.icon;
              const isActive = activeTab === sect.id;
              return (
                <button
                  key={sect.id}
                  onClick={() => setActiveTab(sect.id as GuidelineSection)}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap lg:whitespace-normal shrink-0 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{sect.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:block p-4 rounded-xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100/50 dark:border-orange-900/30 mt-6">
            <h4 className="text-xs font-bold text-orange-900 dark:text-orange-400 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
              Safety Reminder
            </h4>
            <p className="text-[10px] text-orange-800/80 dark:text-orange-400/80 leading-normal">
              Administrators and moderators will never ask for your passwords, credit cards, or banking credentials under any pretext. Report any suspicious queries.
            </p>
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 md:p-8 shadow-sm">
          {activeTab === 'conduct' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  Code of Conduct
                </h2>
                <div className="w-12 h-1 bg-blue-600 rounded mt-2"></div>
              </div>

              <p className="text-xs md:text-sm text-gray-650 dark:text-gray-300 leading-relaxed">
                We are committed to providing a welcoming, inclusive, and professional learning environment for students of all backgrounds. Review our core conduct expectations below:
              </p>

              <div className="space-y-4">
                {ruleItems.filter(r => r.category === 'conduct').map((rule) => {
                  const isExpanded = expandedId === rule.id;
                  return (
                    <div key={rule.id} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleExpand(rule.id)}
                        className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/55 dark:hover:bg-gray-750/30"
                      >
                        <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">{rule.title}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-gray-600 dark:text-gray-350 space-y-4 border-t border-gray-50 dark:border-gray-750/30">
                          <p className="leading-relaxed mt-2">{rule.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-50/50 dark:bg-green-950/10 p-3 rounded-lg border border-green-100/50 dark:border-green-900/30">
                              <h5 className="font-extrabold text-green-800 dark:text-green-400 text-xs mb-1.5 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Do's
                              </h5>
                              <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed text-green-700/90 dark:text-green-400/85">
                                {rule.dos.map((doItem, idx) => <li key={idx}>{doItem}</li>)}
                              </ul>
                            </div>
                            <div className="bg-red-50/50 dark:bg-red-950/10 p-3 rounded-lg border border-red-100/50 dark:border-red-900/30">
                              <h5 className="font-extrabold text-red-800 dark:text-red-400 text-xs mb-1.5 flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5 text-red-650" /> Don'ts
                              </h5>
                              <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed text-red-700/90 dark:text-red-400/85">
                                {rule.donts.map((dontItem, idx) => <li key={idx}>{dontItem}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  Platform Core Rules
                </h2>
                <div className="w-12 h-1 bg-blue-600 rounded mt-2"></div>
              </div>

              <p className="text-xs md:text-sm text-gray-650 dark:text-gray-300 leading-relaxed">
                Rules apply to all listings, comments, community post titles, and user profile bios. Avoid violating platform policies to maintain clean directories:
              </p>

              <div className="space-y-4">
                {ruleItems.filter(r => r.category === 'rules').map((rule) => {
                  const isExpanded = expandedId === rule.id;
                  return (
                    <div key={rule.id} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleExpand(rule.id)}
                        className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/55 dark:hover:bg-gray-750/30"
                      >
                        <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">{rule.title}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-gray-600 dark:text-gray-350 space-y-4 border-t border-gray-50 dark:border-gray-750/30">
                          <p className="leading-relaxed mt-2">{rule.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-50/50 dark:bg-green-950/10 p-3 rounded-lg border border-green-100/50 dark:border-green-900/30">
                              <h5 className="font-extrabold text-green-800 dark:text-green-400 text-xs mb-1.5 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Do's
                              </h5>
                              <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed text-green-700/90 dark:text-green-400/85">
                                {rule.dos.map((doItem, idx) => <li key={idx}>{doItem}</li>)}
                              </ul>
                            </div>
                            <div className="bg-red-50/50 dark:bg-red-950/10 p-3 rounded-lg border border-red-100/50 dark:border-red-900/30">
                              <h5 className="font-extrabold text-red-800 dark:text-red-400 text-xs mb-1.5 flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5 text-red-650" /> Don'ts
                              </h5>
                              <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed text-red-700/90 dark:text-red-400/85">
                                {rule.donts.map((dontItem, idx) => <li key={idx}>{dontItem}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'matrix' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  Violations & Penalty Matrix
                </h2>
                <div className="w-12 h-1 bg-blue-600 rounded mt-2"></div>
              </div>

              <p className="text-xs md:text-sm text-gray-650 dark:text-gray-300 leading-relaxed">
                To maintain high platform standards, our moderation team enforces a multi-tier warning and suspension process depending on the nature and severity of the infraction:
              </p>

              <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-xl">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700 text-xs md:text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-3">Violation Category</th>
                      <th className="px-6 py-3">Initial Infraction</th>
                      <th className="px-6 py-3">Second Offense</th>
                      <th className="px-6 py-3">Severe Escalation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-600 dark:text-gray-350 text-[11px] md:text-xs">
                    {penalties.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/40 dark:hover:bg-gray-750/10">
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{item.violation}</td>
                        <td className="px-6 py-4">{item.warning}</td>
                        <td className="px-6 py-4">{item.action}</td>
                        <td className="px-6 py-4 text-red-650 font-bold dark:text-red-400">{item.severe}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'disputes' && (
            <div className="space-y-6 text-gray-750 dark:text-gray-300 text-xs md:text-sm leading-relaxed">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  Disputes, Appeals & Reporting
                </h2>
                <div className="w-12 h-1 bg-blue-600 rounded mt-2"></div>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  1. How to File a Report
                </h3>
                <p>
                  If you encounter a user, comment, opportunity listing, or message thread that violates our Community Guidelines, please click the "Report" flag icon next to the content. This automatically copies the relevant telemetry logs and passes them directly to our active moderator verification queue. Alternatively, you can open a support ticket under the Help tab.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  2. Review & Appeals Process
                </h3>
                <p>
                  Once a report is submitted, a panel of three community moderators reviews the evidence. The reported user will receive an email notice explaining the flagged violation. If your account has been temporarily locked or suspended and you wish to contest the decision, you can write an appeal explaining the context. 
                </p>
                <p>
                  Appeals are reviewed by senior administrators within 3 to 5 business days. Decisions made by administrators regarding severe harassment, financial scams, or severe plagiarism are final and cannot be reopened.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  Safety Pledge & Quiz
                </h2>
                <div className="w-12 h-1 bg-blue-600 rounded mt-2"></div>
              </div>

              <p className="text-xs md:text-sm text-gray-650 dark:text-gray-300 leading-relaxed">
                Take this quick 4-question assessment to demonstrate your understanding of the community guidelines. Answering all questions correctly unlocks the "Pledged Safe Member" indicator!
              </p>

              {quizSubmitted ? (
                <div className="p-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl text-center space-y-4">
                  <Award className="w-16 h-16 text-green-500 mx-auto fill-green-100 dark:fill-green-900/30 animate-pulse" />
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-green-800 dark:text-green-400">Pledge Completed Successfully!</h3>
                    <p className="text-xs text-green-700/80 dark:text-green-400/85 max-w-md mx-auto">
                      Thank you for committing to a safe and professional mentorship ecosystem. Your pledge status is now active.
                    </p>
                  </div>
                  <div className="flex gap-4 justify-center pt-2">
                    <button 
                      onClick={() => setBadgeClaimed(true)} 
                      disabled={badgeClaimed}
                      className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                        badgeClaimed 
                          ? 'bg-green-200 text-green-800 dark:bg-green-950 dark:text-green-500 cursor-default' 
                          : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                      }`}
                    >
                      {badgeClaimed ? 'Badge Displayed' : 'Display Badge on Profile'}
                    </button>
                    <button 
                      onClick={resetQuiz} 
                      className="px-5 py-2.5 border border-green-200 text-green-700 dark:border-green-900 hover:bg-green-100/50 dark:hover:bg-green-950/20 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reset Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleQuizSubmit} className="space-y-6">
                  {quizQuestions.map((q, idx) => (
                    <div key={q.id} className="border border-gray-150 dark:border-gray-700 p-5 rounded-xl space-y-3 bg-gray-50/50 dark:bg-gray-900/30">
                      <h4 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white flex gap-2">
                        <span>{idx + 1}.</span>
                        <span>{q.question}</span>
                      </h4>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = answers[q.id] === optIdx;
                          const isCorrect = q.correct === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleOptionSelect(q.id, optIdx)}
                              className={`w-full text-left p-3 rounded-lg border text-xs md:text-sm transition-all flex items-center justify-between cursor-pointer ${
                                isSelected 
                                  ? 'border-blue-600 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400 font-medium' 
                                  : 'border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-750/30 text-gray-600 dark:text-gray-350'
                              }`}
                            >
                              <span>{opt}</span>
                              {showResults && isCorrect && <span className="text-[10px] text-green-600 font-bold ml-2">✓ Correct Answer</span>}
                              {showResults && isSelected && !isCorrect && <span className="text-[10px] text-red-600 font-bold ml-2">✗ Incorrect</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {showResults && quizScore < quizQuestions.length && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/25 border border-red-155 text-red-750 dark:text-red-400 rounded-lg text-xs leading-normal">
                      <p className="font-bold">Score: {quizScore} / {quizQuestions.length} correct answers.</p>
                      <p className="mt-0.5">Please review the incorrect questions and re-attempt the quiz to complete your safety pledge.</p>
                      <button 
                        type="button" 
                        onClick={resetQuiz} 
                        className="mt-2.5 px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded font-bold cursor-pointer transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {!showResults && (
                    <button
                      type="submit"
                      disabled={Object.keys(answers).length < quizQuestions.length}
                      className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Pledge Answers</span>
                    </button>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Search, HelpCircle, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, MessageSquare, BookOpen, User, Briefcase, Lock, Sparkles, Send, CheckCircle2, AlertCircle, Wrench, Shield } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

type FAQCategory = 'all' | 'general' | 'account' | 'mentorship' | 'opportunities' | 'ai' | 'troubleshooting' | 'security';

interface FAQItem {
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
}

export default function FAQ() {
  const { theme } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<Record<string, 'up' | 'down' | null>>({});
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedbackStatus(prev => ({
      ...prev,
      [id]: prev[id] === type ? null : type
    }));
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketForm.email && ticketForm.message) {
      setTicketSubmitted(true);
    }
  };

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'general', label: 'General', icon: BookOpen },
    { id: 'account', label: 'Account & Profile', icon: User },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'mentorship', label: 'Mentorship', icon: Sparkles },
    { id: 'ai', label: 'AI Assistant', icon: Lock },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: Wrench },
    { id: 'security', label: 'Security & Privacy', icon: Shield }
  ];

  const faqItems: FAQItem[] = [
    {
      id: 'gen-1',
      category: 'general',
      question: 'What is YuvaHub?',
      answer: 'YuvaHub is a comprehensive, open-source platform designed to bridge the gap between ambitious students, professional mentors, and career-defining opportunities. We aggregate verified internships, competitions, scholarships, and job openings, while providing AI-powered mentorship, application tracking, and a vibrant community forum to support professional growth.'
    },
    {
      id: 'gen-2',
      category: 'general',
      question: 'Is YuvaHub free to use?',
      answer: 'Yes, YuvaHub is completely free for students. As an open-source project and community-driven application, our primary mission is accessibility. You can browse, apply, track opportunities, interact in discussion forums, and consult the AI assistant without any subscription fees.'
    },
    {
      id: 'gen-3',
      category: 'general',
      question: 'How do I contribute to YuvaHub as an open-source developer?',
      answer: 'We welcome all contributions! You can find our main codebase repository on GitHub. To contribute, fork the repository, clone it locally, choose an open issue or suggest a new feature, make your changes on a new branch, write appropriate tests, and open a Pull Request. Please make sure to read our contribution guidelines and code of conduct before getting started.'
    },
    {
      id: 'gen-4',
      category: 'general',
      question: 'Who runs and maintains the YuvaHub platform?',
      answer: 'YuvaHub is maintained by a core group of open-source developers and educational advocates, supported by university student circles. We rely on community moderators and developer contributions to keep the service running, keep the opportunity database verified, and review mentor profiles.'
    },
    {
      id: 'gen-5',
      category: 'general',
      question: 'What are the system requirements for YuvaHub?',
      answer: 'YuvaHub is a fully responsive web application. It runs on any modern web browser (Google Chrome, Mozilla Firefox, Safari, Microsoft Edge, Brave, etc.) on desktop, tablet, and mobile devices. A stable internet connection is required to fetch real-time opportunities and communicate with mentors.'
    },
    {
      id: 'acc-1',
      category: 'account',
      question: 'How do I create and verify my account?',
      answer: 'You can sign up on the landing page using your Google account or GitHub credentials via Firebase Authentication. Once registered, you will be guided through a short onboarding flow where you select your role (Student, Mentor, or Recruiter), interest areas, and key technical skills. Skill verification can be completed by linking your public profiles (e.g. GitHub or LinkedIn).'
    },
    {
      id: 'acc-2',
      category: 'account',
      question: 'Can I change my role after completing the onboarding flow?',
      answer: 'Currently, user roles are set during onboarding to customize your dashboard layout. If you need to switch your role (e.g., from Student to Mentor), please contact support using the ticket form below, and our administration team will update your account settings after verifying your credentials.'
    },
    {
      id: 'acc-3',
      category: 'account',
      question: 'How do I customize my notification preferences?',
      answer: 'Go to the Settings tab on your main sidebar dashboard. Under the "Notifications" card, you can toggle alerts for new opportunity matches, application deadlines, mentorship invites, and community forum updates. Save your settings to apply the configurations immediately.'
    },
    {
      id: 'acc-4',
      category: 'account',
      question: 'How do I permanently delete my account and data?',
      answer: 'If you wish to remove your account, go to the Settings tab, scroll down to the "Account Control" card, and click "Delete Account". Please note that this action is permanent and cannot be undone. All your bookmarks, application history, and profile details will be immediately wiped from our databases.'
    },
    {
      id: 'acc-5',
      category: 'account',
      question: 'What should I do if my profile image does not update?',
      answer: 'We pull your profile image automatically from your login provider (Google or GitHub). If you want to use a different avatar, you can change your profile picture on Google/GitHub, and the changes will reflect on YuvaHub during your next login session. Alternatively, you can clear browser storage and relog.'
    },
    {
      id: 'opp-1',
      category: 'opportunities',
      question: 'How does the opportunity indexing process work?',
      answer: 'YuvaHub uses a hybrid ingestion pipeline. We automatically scrape verified public sites, recruiter boards, and corporate channels. Once ingested, the data goes through a normalisation layer which extracts deadlines, eligibility criteria, and tags. Finally, our admin moderators verify each listing manually before displaying it in the main opportunities feed to prevent spam.'
    },
    {
      id: 'opp-2',
      category: 'opportunities',
      question: 'Can I bookmark opportunities to apply later?',
      answer: 'Absolutely. Every opportunity card has a bookmark icon. Clicking this icon saves the listing to your personal Bookmarks tab on the sidebar. You can also view application deadlines directly on your dashboard checklist for bookmarked opportunities.'
    },
    {
      id: 'opp-3',
      category: 'opportunities',
      question: 'How do I submit an opportunity to the platform?',
      answer: 'If you are a recruiter, mentor, or student who has found an outstanding career event, click the "Submit Opportunity" tab on the sidebar. Fill in the form with detailed metadata (title, category, compensation, deadlines, application link) and submit. The listing will go into our validation queue and will be published once checked by an administrator.'
    },
    {
      id: 'opp-4',
      category: 'opportunities',
      question: 'How long does it take for a submitted opportunity to go live?',
      answer: 'Our volunteer administration team reviews submissions daily. Under ordinary circumstances, a submitted opportunity is audited, categorized, and made live in the public opportunities database within 12 to 24 hours of submission.'
    },
    {
      id: 'opp-5',
      category: 'opportunities',
      question: 'How can I report a expired, broken, or fraudulent opportunity link?',
      answer: 'If you find an opportunity listing that is outdated, has a broken redirection link, or contains suspicious/incorrect criteria, click the "Report listing" flag icon located inside the Opportunity Detail view. This alerts our moderators to review and update the listing.'
    },
    {
      id: 'men-1',
      category: 'mentorship',
      question: 'How do I find and connect with a mentor?',
      answer: 'Navigate to the "Mentorship" tab on the dashboard. You can search mentors by their technical stack, industry experience, or current organization. Once you find a mentor whose background matches your career path, click "Request Connection" and write a short introductory message outlining your goals. You will receive an alert once they accept.'
    },
    {
      id: 'men-2',
      category: 'mentorship',
      question: 'How do I sign up to become a mentor on YuvaHub?',
      answer: 'We are always looking for industry experts to guide the next generation. Choose "Mentor" during account creation or request a role switch. Mentors must complete their profile by adding their current job title, professional highlights, calendar scheduling links, and past mentoring achievements. Admin approval is required for all mentors to maintain platform quality.'
    },
    {
      id: 'men-3',
      category: 'mentorship',
      question: 'How are meeting schedules managed between students and mentors?',
      answer: 'YuvaHub integrates directly with scheduling services like Calendly or Google Calendar. When a mentor accepts your connection request, you can view their calendar link on their profile to book a mutually convenient slot. All communication is held via secure, encrypted channels.'
    },
    {
      id: 'men-4',
      category: 'mentorship',
      question: 'Is there a limit to how many connection requests I can send?',
      answer: 'To prevent spam and ensure high-quality mentorship connections, students are limited to 3 active pending connection requests at any time. Once a mentor accepts or declines a request, that slot is freed up for you to connect with others.'
    },
    {
      id: 'men-5',
      category: 'mentorship',
      question: 'What is expected from a mentor on the YuvaHub platform?',
      answer: 'Mentors are expected to act in a professional, encouraging, and supportive manner. This includes offering constructive feedback on resumes, providing general career roadmap advice, answering industry-related queries, and keeping scheduled meeting appointments.'
    },
    {
      id: 'ai-1',
      category: 'ai',
      question: 'What is the AI Assistant and how can it help me?',
      answer: 'The AI Assistant is a specialized agent integrated directly into YuvaHub. It has access to our database of indexed opportunities, your profile details, and career guides. It can help you search opportunities using natural language, tailor your resume summary for specific roles, simulate technical mock interviews, and suggest specialized learning paths.'
    },
    {
      id: 'ai-2',
      category: 'ai',
      question: 'Is my data secure when using the AI Assistant?',
      answer: 'Yes. We prioritize user data privacy. The queries you submit to the AI Assistant are sent securely to our configured LLM providers (Google Gemini or Anthropic Claude) via server-side endpoints. We do not transmit any personally identifiable data (like your email or password) to these APIs, and your inputs are never used to train external models.'
    },
    {
      id: 'ai-3',
      category: 'ai',
      question: 'How often can I chat with the AI Assistant?',
      answer: 'To ensure stable operation and fair usage for all community members, the AI Assistant currently operates under a soft limit of 50 queries per day. If you reach your limit, your quota will automatically reset at midnight.'
    },
    {
      id: 'trouble-1',
      category: 'troubleshooting',
      question: 'What should I do if the opportunities feed fails to load?',
      answer: 'First, check if your internet connection is active. Next, try reloading the web page. If the issue persists, the backend server might be going through a routine sync. Look at the live status dot in the bottom-right footer strip; if it is red ("Offline"), wait a minute or two and try again.'
    },
    {
      id: 'trouble-2',
      category: 'troubleshooting',
      question: 'I cannot sign in using GitHub/Google auth. How do I fix this?',
      answer: 'Auth blocks are usually caused by browser extensions (such as strict ad-blockers or script-blockers) blocking Firebase redirect popups. Try disabling ad-blockers for YuvaHub, or use an incognito window. Additionally, ensure that cookies are enabled for firebaseapp.com.'
    },
    {
      id: 'trouble-3',
      category: 'troubleshooting',
      question: 'The dashboard displays incorrect opportunity deadlines. Why?',
      answer: 'YuvaHub dates are parsed in UTC format and adjusted automatically to your local browser timezone. Ensure your device\'s system clock and timezone settings are correct. If you find an error in the opportunity deadline database, please report it via the details flag.'
    },
    {
      id: 'sec-1',
      category: 'security',
      question: 'How is my private profile data protected?',
      answer: 'YuvaHub stores user data inside secured MongoDB and Firebase clusters. All communications between your browser and our servers are encrypted using TLS 1.3. We do not sell or lease profile information to third-party advertisers. Please refer to our Security Center for full technical information.'
    },
    {
      id: 'sec-2',
      category: 'security',
      question: 'Does YuvaHub track my browser cookies?',
      answer: 'No. YuvaHub does not use any marketing, advertising, or tracker cookies. We only store functional credentials (like your authentication tokens) inside browser localStorage to keep you logged in. No cross-site tracking takes place on our platform.'
    }
  ];

  const filteredItems = faqItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* FAQ Header Banner */}
      <div className="text-center py-10 mb-8 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-3">
          <HelpCircle className="w-10 h-10 text-blue-600 dark:text-blue-500" />
          Help & Support Center
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
          Find answers to common questions about accounts, opportunities, mentorship, and our AI assistant.
        </p>

        {/* Global Search Bar */}
        <div className="relative max-w-lg mx-auto mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search FAQs by keywords (e.g. mentor, database, signup)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all text-gray-900 dark:text-white text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-450 dark:text-gray-500 mb-2 pl-2">
            Categories
          </h3>
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as FAQCategory)}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap lg:whitespace-normal shrink-0 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:block p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 mt-6">
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-400 flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Need Personal Help?
            </h4>
            <p className="text-[10px] text-blue-800/80 dark:text-blue-400/80 leading-normal">
              If your question is not listed here, feel free to fill out the support ticket form below and our team will get back to you directly.
            </p>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 px-4 text-gray-500 dark:text-gray-400">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-355 dark:text-gray-600" />
                <p className="text-sm font-semibold">No questions matched your search query</p>
                <p className="text-xs mt-1">Try searching for other terms or check our categories.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-750">
                {filteredItems.map((item) => {
                  const isExpanded = expandedId === item.id;
                  const itemFeedback = feedbackStatus[item.id];
                  return (
                    <div key={item.id} className="transition-colors hover:bg-gray-50/40 dark:hover:bg-gray-700/10">
                      {/* Accordion Trigger */}
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">
                          {item.question}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                        )}
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-50 dark:border-gray-750/30">
                          <p>{item.answer}</p>
                          
                          {/* Helpful/Feedback bar */}
                          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-750 flex items-center justify-between flex-wrap gap-2 text-[10px] md:text-xs">
                            <span className="text-gray-400 dark:text-gray-550">Was this answer helpful?</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleFeedback(item.id, 'up')}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
                                  itemFeedback === 'up' 
                                    ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900' 
                                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>Yes</span>
                              </button>
                              <button
                                onClick={() => handleFeedback(item.id, 'down')}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
                                  itemFeedback === 'down' 
                                    ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900' 
                                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                <ThumbsDown className="w-3 h-3" />
                                <span>No</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Direct Ticket Form */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm mt-8">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Submit a Support Ticket</h3>
            </div>
            
            {ticketSubmitted ? (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-150 text-green-750 dark:text-green-400 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Ticket submitted successfully!</p>
                  <p className="text-xs mt-0.5">We have logged your query and will reply via email within 24 hours.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs md:text-sm text-gray-900 dark:text-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-gray-600 dark:text-gray-450">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({...ticketForm, name: e.target.value})}
                      className="w-full text-xs p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-gray-600 dark:text-gray-455">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm({...ticketForm, email: e.target.value})}
                      className="w-full text-xs p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-gray-600 dark:text-gray-450">Subject</label>
                    <input 
                      type="text" 
                      required
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                      className="w-full text-xs p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-gray-600 dark:text-gray-450">Priority Level</label>
                    <select 
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                      className="w-full text-xs p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white"
                    >
                      <option value="low">Low (General Feedback)</option>
                      <option value="medium">Medium (Usability Issues)</option>
                      <option value="high">High (Blocked / Account Issues)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1 text-gray-600 dark:text-gray-450">Message / Question Details</label>
                  <textarea 
                    required
                    rows={4}
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                    placeholder="Describe your issue, question, or suggestion in detail..."
                    className="w-full text-xs p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 dark:text-white"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Ticket</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

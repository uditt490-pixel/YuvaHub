import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, BookOpen, UserCheck, Zap, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function HelpCenter() {
  const { setActiveTab } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const guides = [
    {
      category: 'Account & Login',
      q: 'How do I log into YuvaHub?',
      a: 'Click "Sign In" at the top right of the page and sign in using your Google or GitHub account.'
    },
    {
      category: 'Opportunities',
      q: 'How does Gemini AI match opportunities to my profile?',
      a: 'Gemini AI evaluates your skills, degree year, and interests against live opportunity requirements to calculate Affinity Scores.'
    },
    {
      category: 'Submissions',
      q: 'How can GDSC leads or hackathon hosts list an event?',
      a: 'Organizers can submit opportunities directly through the "Submit Opportunity" tab inside the user dashboard.'
    },
    {
      category: 'Resume Review',
      q: 'Is the ATS Resume Auditor free to use?',
      a: 'Yes! All student career tools including ATS resume reviewing and cover letter generation are 100% free.'
    }
  ];

  const filteredGuides = guides.filter(g => 
    g.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-[#231f20] font-sans pb-20 selection:bg-[#f3e4bd] selection:text-[#603620]">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-4 pt-10 pb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f3e4bd] border border-[#e8ded1] text-[#603620] text-xs font-bold uppercase tracking-widest rounded-full">
          <HelpCircle className="w-3.5 h-3.5 text-[#b56b37]" /> Student Support Hub
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight text-[#231f20]">
          Help Center & <span className="italic text-[#b56b37]">Documentation</span>
        </h1>
        <p className="text-sm text-[#603620] max-w-xl mx-auto">
          Find answers to common questions about opportunity discovery, AI matching, and submissions.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto p-2 bg-white border border-[#e8ded1] rounded-2xl shadow-md flex items-center gap-2">
          <Search className="w-5 h-5 text-[#8c7569] ml-3 shrink-0" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help topics..."
            className="w-full bg-transparent border-none outline-none text-sm text-[#231f20] placeholder:text-[#8c7569] py-2"
          />
        </div>
      </div>

      {/* FAQ Guide Accordion */}
      <div className="max-w-3xl mx-auto space-y-4">
        {filteredGuides.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx}
              onMouseEnter={() => setOpenIndex(idx)}
              onMouseLeave={() => setOpenIndex(null)}
              className={`border rounded-2xl overflow-hidden bg-white transition-all duration-300 cursor-pointer ${
                isOpen ? 'border-[#b56b37] shadow-lg scale-[1.01]' : 'border-[#e8ded1] hover:border-[#b56b37]/60'
              }`}
            >
              <div className="p-5 flex justify-between items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#b56b37] uppercase tracking-wider">{item.category}</span>
                  <h4 className="font-bold text-sm sm:text-base text-[#231f20]">{item.q}</h4>
                </div>
                <span className={`p-2 rounded-xl bg-[#fcf9f2] text-[#603620] transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#f3e4bd] text-[#b56b37]' : ''}`}>
                  <ChevronDown className="w-4 h-4" />
                </span>
              </div>
              {isOpen && (
                <div className="px-5 pb-5 border-t border-[#e8ded1] pt-4 text-xs md:text-sm text-[#603620] leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Direct Contact Banner */}
      <div className="max-w-3xl mx-auto mt-14 bg-[#603620] text-[#fcf9f2] p-8 rounded-3xl text-center space-y-4 shadow-xl">
        <h3 className="text-xl font-serif font-bold text-[#f3e4bd]">Still need assistance?</h3>
        <p className="text-xs text-[#fcf9f2]/80">Our student support team responds within 24 hours.</p>
        <button
          onClick={() => { setActiveTab('support'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="px-6 py-3 bg-[#b56b37] hover:bg-white hover:text-[#603620] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
        >
          Contact Support <Mail className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}

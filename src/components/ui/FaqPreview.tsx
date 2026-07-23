/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight, Sparkles, Search, Filter, Bookmark, TrendingUp } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { FaqAccordion } from './FaqAccordion';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const PREVIEW_FAQS: FaqItem[] = [
  {
    id: 'preview-1',
    category: 'General',
    question: 'What is YuvaHub?',
    answer: 'YuvaHub is a platform that helps students and early-career professionals discover verified opportunities—internships, hackathons, scholarships, jobs—and connect with mentors and community discussions in one place.',
  },
  {
    id: 'preview-2',
    category: 'Getting Started',
    question: 'How do I get started on YuvaHub?',
    answer: 'Sign in with Google or GitHub, complete onboarding and your profile, then explore Opportunities from the sidebar. You can bookmark listings, ask the AI Assistant for matches, and join Community discussions anytime.',
  },
  {
    id: 'preview-3',
    category: 'Account',
    question: 'How do I edit my profile?',
    answer: 'Open the Profile tab from the sidebar and use Edit Profile to update your photo, bio, skills, and social links. Keeping skills up to date helps the AI Assistant recommend better matches.',
  },
  {
    id: 'preview-4',
    category: 'Authentication',
    question: 'Which sign-in methods does YuvaHub support?',
    answer: 'You can sign in with Google or GitHub from the welcome screen. Choose the same provider each time so your profile and bookmarks stay linked to the correct account.',
  },
  {
    id: 'preview-5',
    category: 'Opportunities',
    question: 'How do I apply to an opportunity?',
    answer: 'Open an opportunity for details, then follow the Apply link or Apply Assist flow when available. Complete your profile first so applications reflect accurate skills and experience.',
  },
];

export function FaqPreview() {
  const { setActiveTab } = useAppContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleViewAll = () => {
    setActiveTab('help');
  };

  return (
    <section className="relative bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-900/30 border border-gray-200/70 dark:border-gray-700/70 rounded-3xl p-8 shadow-xl shadow-blue-500/10 overflow-hidden backdrop-blur-sm">
      {/* Animated background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/10" />
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-4 h-4 text-blue-400 dark:text-blue-400 absolute -top-1 -right-1 animate-bounce" />
              </div>
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
              Find quick answers before contacting support. Our FAQ covers common questions about YuvaHub.
            </p>
          </div>
          <button
            onClick={handleViewAll}
            className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 hover:scale-105 active:scale-95 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md animate-in fade-in slide-in-from-right-4 duration-700 delay-100"
          >
            View All FAQs
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
          {[
            { icon: Search, label: 'Instant Search' },
            { icon: Filter, label: 'Smart Filters' },
            { icon: Bookmark, label: 'Save Favorites' },
            { icon: TrendingUp, label: 'AI-Powered' },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium border border-blue-100 dark:border-blue-900/50"
              >
                <Icon className="w-3.5 h-3.5" />
                {feature.label}
              </div>
            );
          })}
        </div>

        <ul className="space-y-4 list-none p-0 m-0">
          {PREVIEW_FAQS.map((faq, index) => (
            <div
              key={faq.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <FaqAccordion
                faq={faq}
                isOpen={expandedId === faq.id}
                onToggle={() => handleToggle(faq.id)}
                index={index}
              />
            </div>
          ))}
        </ul>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <button
            onClick={handleViewAll}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-1 active:scale-95 relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              View All FAQs in Help Center
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Browse 20+ categories with 100+ answered questions
          </p>
        </div>
      </div>
    </section>
  );
}

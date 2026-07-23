/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, MailCheck, UserCircle, Compass, FileCheck, MessageSquare, CheckCircle2, Shield, Lock, Zap, ArrowRight, Clock, FileText, Link as LinkIcon, Upload, Star, TrendingUp, Search, Filter, Bookmark, Sparkles, AlertCircle, Check, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

type StepId = 'gs-1' | 'gs-2' | 'gs-3' | 'gs-4' | 'gs-5' | 'gs-6';

interface GettingStartedDetailProps {
  stepId: StepId;
}

const STEP_CONTENT: Record<StepId, {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  sections: Array<{
    title: string;
    content: string | Array<{ label: string; description: string; icon?: React.ComponentType<{ className?: string }> }>;
    type?: 'cards' | 'timeline' | 'steps' | 'progress' | 'default';
  }>;
  ctaText?: string;
  ctaAction?: string;
  showProgress?: boolean;
  showSuccess?: boolean;
}> = {
  'gs-1': {
    title: 'Create Account',
    subtitle: 'Sign in with Google or GitHub to get started',
    icon: UserPlus,
    description: 'Get started in seconds with secure OAuth authentication. No passwords to remember, just one-click access to all YuvaHub features.',
    sections: [
      {
        title: 'Sign In Methods',
        type: 'cards',
        content: [
          { label: 'Google Sign In', description: 'Click the "Continue with Google" button to sign in using your Google account. This is the fastest way to get started.', icon: CheckCircle2 },
          { label: 'GitHub Sign In', description: 'Click the "Continue with GitHub" button to sign in using your GitHub account. Perfect for developers.', icon: CheckCircle2 },
        ],
      },
      {
        title: 'Why OAuth?',
        type: 'default',
        content: 'We use OAuth (Google and GitHub) for authentication because it\'s secure, convenient, and you don\'t need to remember another password. Your credentials are handled by trusted providers.',
      },
      {
        title: 'Benefits',
        type: 'cards',
        content: [
          { label: 'Secure', description: 'Your credentials are never stored on our servers.', icon: Shield },
          { label: 'Fast', description: 'One-click sign in, no lengthy forms to fill.', icon: Zap },
          { label: 'Trusted', description: 'Authentication handled by Google and GitHub.', icon: Lock },
        ],
      },
      {
        title: 'Common Issues',
        type: 'cards',
        content: [
          { label: 'Popup Blocked', description: 'If the sign-in popup doesn\'t appear, check your browser\'s popup settings and allow popups for YuvaHub.', icon: AlertCircle },
          { label: 'Wrong Account', description: 'Make sure you\'re signed into the correct Google or GitHub account before clicking sign in.', icon: AlertCircle },
        ],
      },
      {
        title: 'Security Tips',
        type: 'cards',
        content: [
          { label: 'Use Strong Passwords', description: 'Even though we use OAuth, ensure your Google/GitHub accounts have strong passwords.', icon: Shield },
          { label: 'Enable 2FA', description: 'Enable two-factor authentication on your Google/GitHub accounts for extra security.', icon: Lock },
        ],
      },
    ],
    ctaText: 'Sign In Now',
    ctaAction: 'signin',
  },
  'gs-2': {
    title: 'Verify Email',
    subtitle: 'Confirm your email address to unlock all features',
    icon: MailCheck,
    description: 'Email verification ensures account security and unlocks all YuvaHub features. The process is quick and straightforward.',
    sections: [
      {
        title: 'Why Verification Matters',
        type: 'default',
        content: 'Email verification ensures that you own the email address associated with your account. It helps prevent spam accounts and keeps our community safe.',
      },
      {
        title: 'Verification Steps',
        type: 'timeline',
        content: [
          { label: 'Step 1', description: 'After signing in, check your email inbox for a verification message from YuvaHub.', icon: MailCheck },
          { label: 'Step 2', description: 'Click the verification link in the email.', icon: Check },
          { label: 'Step 3', description: 'You\'ll be redirected back to YuvaHub with a verified account.', icon: CheckCircle2 },
        ],
      },
      {
        title: 'Didn\'t Receive Email?',
        type: 'cards',
        content: [
          { label: 'Check Spam Folder', description: 'Sometimes verification emails end up in spam. Check your spam/junk folder.', icon: AlertCircle },
          { label: 'Wait a Few Minutes', description: 'Email delivery can take a few minutes. Please wait before requesting a resend.', icon: Clock },
        ],
      },
      {
        title: 'Resend Email',
        type: 'default',
        content: 'If you still haven\'t received the verification email after 10 minutes, you can request a resend from your profile settings.',
      },
      {
        title: 'Troubleshooting',
        type: 'cards',
        content: [
          { label: 'Wrong Email', description: 'If you signed up with the wrong email, you\'ll need to sign up again with the correct one.', icon: X },
          { label: 'Expired Link', description: 'Verification links expire after 24 hours. Request a new one if needed.', icon: Clock },
        ],
      },
    ],
    ctaText: 'Resend Verification Email',
    ctaAction: 'resend',
  },
  'gs-3': {
    title: 'Complete Profile',
    subtitle: 'Add your skills and experience to get better matches',
    icon: UserCircle,
    description: 'A complete profile helps our AI recommend the best opportunities for you. Fill in all sections to maximize your visibility.',
    sections: [
      {
        title: 'Upload Profile Picture',
        type: 'default',
        content: 'Add a professional profile picture to help others recognize you. A clear, friendly photo works best.',
      },
      {
        title: 'Add Skills',
        type: 'cards',
        content: [
          { label: 'Technical Skills', description: 'Add programming languages, frameworks, and tools you know.', icon: Star },
          { label: 'Soft Skills', description: 'Include communication, teamwork, leadership, and other soft skills.', icon: Star },
        ],
      },
      {
        title: 'Write Your Bio',
        type: 'default',
        content: 'Write a short bio about yourself. Include your background, interests, and what you\'re looking for on YuvaHub.',
      },
      {
        title: 'Upload Resume',
        type: 'default',
        content: 'Upload your resume in PDF format. This helps recruiters learn more about your experience.',
      },
      {
        title: 'Add Portfolio Links',
        type: 'cards',
        content: [
          { label: 'GitHub', description: 'Link to your GitHub profile to showcase your projects.', icon: LinkIcon },
          { label: 'LinkedIn', description: 'Add your LinkedIn profile for professional networking.', icon: LinkIcon },
          { label: 'Portfolio', description: 'Link to your personal portfolio website.', icon: LinkIcon },
        ],
      },
    ],
    ctaText: 'Complete Your Profile',
    ctaAction: 'profile',
    showProgress: true,
  },
  'gs-4': {
    title: 'Explore Opportunities',
    subtitle: 'Find and apply to opportunities that match your skills',
    icon: Compass,
    description: 'Discover thousands of verified opportunities including internships, jobs, hackathons, and scholarships tailored to your skills.',
    sections: [
      {
        title: 'Search',
        type: 'default',
        content: 'Use the search bar to find opportunities by keyword, company, or location. The search is instant and filters results in real-time.',
      },
      {
        title: 'Filters',
        type: 'cards',
        content: [
          { label: 'Type', description: 'Filter by opportunity type: internships, jobs, hackathons, scholarships.', icon: Filter },
          { label: 'Category', description: 'Filter by category: tech, business, design, etc.', icon: Filter },
          { label: 'Location', description: 'Filter by location: remote, on-site, or specific cities.', icon: Filter },
        ],
      },
      {
        title: 'Categories',
        type: 'default',
        content: 'Browse opportunities by category to discover new opportunities in your field of interest.',
      },
      {
        title: 'Bookmarks',
        type: 'default',
        content: 'Save opportunities you\'re interested in by clicking the bookmark icon. Access your bookmarks from the Bookmarks tab.',
      },
      {
        title: 'AI Recommendations',
        type: 'default',
        content: 'Our AI Assistant analyzes your profile and recommends opportunities that match your skills and interests. Check the AI Assistant tab for personalized recommendations.',
      },
    ],
    ctaText: 'Browse Opportunities',
    ctaAction: 'opportunities',
  },
  'gs-5': {
    title: 'Register / Apply',
    subtitle: 'Submit your application and track your progress',
    icon: FileCheck,
    description: 'Apply to opportunities with confidence using our AI-powered Apply Assist. Track your applications in real-time.',
    sections: [
      {
        title: 'Application Flow',
        type: 'timeline',
        content: [
          { label: 'Step 1', description: 'Find an opportunity you\'re interested in.', icon: Search },
          { label: 'Step 2', description: 'Click the Apply button or use Apply Assist for help.', icon: FileCheck },
          { label: 'Step 3', description: 'Complete the application form with your details.', icon: FileText },
          { label: 'Step 4', description: 'Submit and track your application status.', icon: CheckCircle2 },
        ],
      },
      {
        title: 'Timeline',
        type: 'default',
        content: 'After submitting, you can track your application status in real-time. Status updates include: Submitted, Under Review, Interview, Offer, Rejected.',
      },
      {
        title: 'Required Documents',
        type: 'cards',
        content: [
          { label: 'Resume', description: 'Keep your resume updated and ready to upload.', icon: FileText },
          { label: 'Cover Letter', description: 'Some opportunities may require a cover letter.', icon: FileText },
          { label: 'Portfolio', description: 'Have your portfolio links ready for creative roles.', icon: LinkIcon },
        ],
      },
      {
        title: 'Apply Assist',
        type: 'default',
        content: 'Use our AI-powered Apply Assist to help you craft better applications. It provides suggestions for improving your resume and cover letter.',
      },
      {
        title: 'Success Tips',
        type: 'cards',
        content: [
          { label: 'Customize', description: 'Tailor your application to each opportunity.', icon: TrendingUp },
          { label: 'Research', description: 'Learn about the company before applying.', icon: Search },
          { label: 'Follow Up', description: 'Send a polite follow-up if you don\'t hear back within a week.', icon: MessageSquare },
        ],
      },
    ],
    ctaText: 'Start Applying',
    ctaAction: 'opportunities',
    showSuccess: true,
  },
  'gs-6': {
    title: 'Support & Feedback',
    subtitle: 'Get help and share your thoughts with us',
    icon: MessageSquare,
    description: 'Our support team is here to help. Contact us for assistance, report bugs, or share your feedback to help us improve.',
    sections: [
      {
        title: 'Contact Support',
        type: 'default',
        content: 'If you need help with anything, use the Support & Feedback tab to contact our team. We typically respond within 24 hours.',
      },
      {
        title: 'Report a Bug',
        type: 'default',
        content: 'Found a bug? Let us know! Use the bug report form in the Support section. Include steps to reproduce the issue.',
      },
      {
        title: 'Request a Feature',
        type: 'default',
        content: 'Have an idea for improving YuvaHub? We\'d love to hear it! Submit feature requests through the Support section.',
      },
      {
        title: 'Community Help',
        type: 'default',
        content: 'Join our community discussions to get help from other users. Share your experiences and learn from others.',
      },
      {
        title: 'Feedback',
        type: 'default',
        content: 'Your feedback helps us improve. Rate your experience and leave comments about what you like or what could be better.',
      },
    ],
    ctaText: 'Contact Support',
    ctaAction: 'support',
  },
};

export default function GettingStartedDetail({ stepId }: GettingStartedDetailProps) {
  const { setActiveTab, setGettingStartedStep, user } = useAppContext();
  const [loaded, setLoaded] = useState(false);
  const content = STEP_CONTENT[stepId];
  const Icon = content.icon;

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleBack = () => {
    // Clear the step so HelpCenterPage renders (not GettingStartedDetail again)
    setGettingStartedStep(null);
    setActiveTab('help');
  };

  const handleCta = () => {
    // All CTAs go to dashboard (home).
    setGettingStartedStep(null);
    setActiveTab('dashboard');
  };

  const renderSectionContent = (section: any, sectionIndex: number) => {
    if (section.type === 'cards' && Array.isArray(section.content)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {section.content.map((item: any, itemIndex: number) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={itemIndex}
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
                style={{ animationDelay: `${(sectionIndex * 100) + (itemIndex * 50)}ms` }}
              >
                {ItemIcon && (
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <ItemIcon className="w-5 h-5" />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.label}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      );
    }

    if (section.type === 'timeline' && Array.isArray(section.content)) {
      return (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-900"></div>
          {section.content.map((item: any, itemIndex: number) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={itemIndex}
                className="relative pl-12 pb-8 last:pb-0"
                style={{ animationDelay: `${(sectionIndex * 100) + (itemIndex * 100)}ms` }}
              >
                <div className="absolute left-0 w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  {ItemIcon && <ItemIcon className="w-4 h-4 text-white" />}
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (Array.isArray(section.content)) {
      return (
        <div className="space-y-4">
          {section.content.map((item: any, itemIndex: number) => (
            <div
              key={itemIndex}
              className="border-l-2 border-blue-200 dark:border-blue-900 pl-4 hover:border-blue-400 dark:hover:border-blue-600 transition-colors duration-300"
              style={{ animationDelay: `${(sectionIndex * 100) + (itemIndex * 50)}ms` }}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.label}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{section.content}</p>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
      <div className={`max-w-6xl mx-auto px-4 py-8 transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Breadcrumb */}
        <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors hover:gap-3 duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Help Center
          </button>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-gray-800/40 dark:to-gray-900/10 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 mb-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {/* Animated background blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/5 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/5 dark:bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/10" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-in zoom-in duration-500">
              <Icon className="w-10 h-10 text-white" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
                {content.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-3 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-300">
                {content.subtitle}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
                {content.description}
              </p>
              
              {/* Progress Bar for Complete Profile */}
              {content.showProgress && (
                <div className="mt-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Profile Completion</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">0%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full transition-all duration-1000 ease-out animate-in slide-in-from-left-4 duration-1000"
                      style={{ width: '0%' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Complete all sections to reach 100% and get better opportunity matches.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {content.sections.map((section, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                {section.type === 'timeline' && <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                {section.type === 'cards' && <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                {section.title}
              </h2>
              {renderSectionContent(section, index)}
            </div>
          ))}

          {/* Success Illustration for Register/Apply */}
          {content.showSuccess && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl border border-green-200 dark:border-green-800 p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20 animate-in zoom-in duration-500">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You're Ready to Apply!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Follow the steps above to submit your application. Our AI-powered Apply Assist will help you craft the perfect application.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI-Powered</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                  <FileCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Real-time Tracking</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                  <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Smart Suggestions</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          {content.ctaText && (
            <button
              onClick={handleCta}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1 active:scale-95"
            >
              {content.ctaText}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          <div className="mt-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

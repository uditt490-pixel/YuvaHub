import React from 'react';

interface LoadingScreenProps {
  fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ fullScreen = false }) => {
  return (
    <div 
      className={`${fullScreen ? 'min-h-screen' : 'h-full min-h-[50vh]'} w-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 gap-6 transition-colors`}
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      <div className="flex items-center gap-3 animate-pulse">
         <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/20">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
         </div>
         <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white transition-colors">
           Yuva<span className="text-[#2563EB]">Hub</span>
         </h1>
      </div>
      <div className="flex gap-2" aria-hidden="true">
        <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};

export default LoadingScreen;

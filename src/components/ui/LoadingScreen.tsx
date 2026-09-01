import React from 'react';
import { Zap } from 'lucide-react';

interface LoadingScreenProps {
  fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ fullScreen = false }) => {
  return (
    <div 
      className={`${fullScreen ? 'min-h-screen' : 'h-full min-h-[50vh]'} w-full flex flex-col items-center justify-center bg-background dark:bg-slate-900 gap-6 transition-colors`}
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-[#603620] flex items-center justify-center shadow-md shadow-[#603620]/20">
          <Zap className="w-6 h-6 text-[#f3e4bd]" />
        </div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-text-primary dark:text-white transition-colors">
          Yuva<span className="text-primary-blue italic">Hub</span>
        </h1>
      </div>
      <div className="flex gap-2" aria-hidden="true">
        <div className="w-2.5 h-2.5 rounded-full bg-primary-blue animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#603620] animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2.5 h-2.5 rounded-full bg-primary-blue animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};

export default LoadingScreen;

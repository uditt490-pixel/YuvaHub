import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { scrollContentToTop } from '../../lib/smoothScroll';

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const contentEl = document.getElementById('app-content');
    if (!contentEl) return;

    const handleScroll = () => {
      setIsVisible(contentEl.scrollTop > 250);
    };

    contentEl.addEventListener('scroll', handleScroll);
    return () => contentEl.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollContentToTop}
      aria-label="Back to top"
      title="Back to top"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3 py-2.5 sm:px-3.5 sm:py-2.5 rounded-full bg-[#603620] text-[#f3e4bd] border border-border-theme shadow-lg hover:bg-primary-blue hover:text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
    >
      <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
      <span className="text-[11px] font-extrabold uppercase tracking-wider hidden sm:inline">Top</span>
    </button>
  );
}
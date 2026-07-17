import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { scrollContentToTop } from '../../lib/smoothScroll';

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const contentEl = document.getElementById('app-content');
    if (!contentEl) return;

    const handleScroll = () => {
      setIsVisible(contentEl.scrollTop > 10);
    };

    contentEl.addEventListener('scroll', handleScroll);
    return () => contentEl.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollContentToTop}
      aria-label="Back to top"
      className="absolute bottom-16 right-6 z-30 w-11 h-11 rounded-full bg-[#2563EB] text-white shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faq: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  index?: number;
  searchQuery?: string;
}

export function FaqAccordion({ faq, isOpen, onToggle, index = 0, searchQuery = '' }: FaqAccordionProps) {
  const panelId = `${faq.id}-panel`;
  const buttonId = `${faq.id}-button`;
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const rippleCounter = useRef(0);

  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(
      regex,
      '<mark class="bg-yellow-200 dark:bg-yellow-600/30 text-yellow-900 dark:text-yellow-200 rounded px-0.5">$1</mark>'
    );
  };

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // Ripple effect
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = ++rippleCounter.current;
      setRipples((prev) => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
      onToggle();
    },
    [onToggle]
  );

  return (
    <li
      className={`border rounded-2xl overflow-hidden bg-white dark:bg-gray-800 transition-all duration-300 ease-out ${
        isOpen
          ? 'border-blue-400 dark:border-blue-500 shadow-lg shadow-blue-500/10 -translate-y-[2px] scale-[1.005]'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300/70 hover:shadow-md hover:-translate-y-0.5 hover:shadow-blue-500/5'
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <h3 className="m-0">
        <button
          id={buttonId}
          type="button"
          onClick={handleClick}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className={`w-full text-left p-5 flex justify-between items-start gap-4 cursor-pointer bg-transparent border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 transition-all duration-200 relative overflow-hidden select-none ${
            isOpen
              ? 'bg-blue-50/40 dark:bg-blue-950/20'
              : 'hover:bg-gray-50/70 dark:hover:bg-gray-900/20'
          }`}
        >
          {/* Ripple elements */}
          {ripples.map((r) => (
            <span
              key={r.id}
              className="absolute pointer-events-none rounded-full animate-ping bg-blue-400/20"
              style={{
                left: r.x - 20,
                top: r.y - 20,
                width: 40,
                height: 40,
              }}
            />
          ))}

          <div className="space-y-2 min-w-0 flex-1 relative z-10">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 ${
                isOpen
                  ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-800'
                  : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50'
              }`}
            >
              {faq.category}
            </span>
            <span
              className={`block font-bold text-sm md:text-base leading-snug transition-colors duration-200 ${
                isOpen ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
              }`}
              dangerouslySetInnerHTML={{ __html: highlightText(faq.question) }}
            />
          </div>

          {/* Chevron with smooth rotation + scale */}
          <span
            className={`p-2 rounded-xl shrink-0 transition-all duration-300 ease-out relative z-10 ${
              isOpen
                ? 'rotate-180 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 scale-110'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-500 group-hover:bg-gray-100'
            }`}
            aria-hidden="true"
          >
            <ChevronDown className="w-4 h-4" />
          </span>
        </button>
      </h3>

      {/* Smooth height reveal via grid-rows transition */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div
            className={`px-5 pb-5 border-t transition-all duration-300 ease-out ${
              isOpen
                ? 'opacity-100 translate-y-0 border-blue-100 dark:border-blue-900/30'
                : 'opacity-0 -translate-y-1 border-gray-100 dark:border-gray-700'
            }`}
          >
            <p
              className="pt-4 text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed m-0"
              dangerouslySetInnerHTML={{ __html: highlightText(faq.answer) }}
            />
          </div>
        </div>
      </div>
    </li>
  );
}

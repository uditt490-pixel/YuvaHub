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
      className={`border rounded-2xl overflow-hidden bg-white transition-all duration-300 ${
        isOpen
          ? 'border-[#b56b37] shadow-xs'
          : 'border-[#e8ded1] hover:border-[#b56b37]'
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
          className={`w-full text-left p-5 flex justify-between items-start gap-4 cursor-pointer bg-transparent border-none focus:outline-none transition-all duration-200 relative overflow-hidden select-none ${
            isOpen
              ? 'bg-[#fcf9f2]'
              : 'hover:bg-[#fcf9f2]'
          }`}
        >
          {/* Ripple elements */}
          {ripples.map((r) => (
            <span
              key={r.id}
              className="absolute pointer-events-none rounded-full animate-ping bg-[#b56b37]/20"
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
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border transition-all ${
                isOpen
                  ? 'bg-[#f6efe2] text-[#b56b37] border-[#e8ded1]'
                  : 'bg-[#fcf9f2] text-[#603620] border-[#e8ded1]'
              }`}
            >
              {faq.category}
            </span>

            <div
              className={`text-sm md:text-base font-serif font-bold text-[#231f20] leading-snug transition-colors ${
                isOpen ? 'text-[#b56b37]' : 'group-hover:text-[#b56b37]'
              }`}
              dangerouslySetInnerHTML={{ __html: highlightText(faq.question) }}
            />
          </div>

          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
              isOpen
                ? 'bg-[#603620] text-[#f3e4bd] rotate-180'
                : 'bg-[#f6efe2] text-[#8c7569]'
            }`}
          >
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </div>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows] duration-300 ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div
            className={`p-5 pt-3 text-xs md:text-sm text-[#603620] leading-relaxed border-t border-[#e8ded1] transition-opacity duration-300 ${
              isOpen ? 'opacity-100' : 'opacity-0'
            }`}
            dangerouslySetInnerHTML={{ __html: highlightText(faq.answer) }}
          />
        </div>
      </div>
    </li>
  );
}

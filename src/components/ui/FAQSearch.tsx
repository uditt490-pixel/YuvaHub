/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

interface FAQSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  resultCount?: number;
}

export default function FAQSearch({
  value,
  onChange,
  onClear,
  placeholder = 'Search questions, answers, categories…',
  resultCount,
}: FAQSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="mt-8 max-w-2xl mx-auto relative z-10 transition-all duration-300 focus-within:scale-[1.01]">
      <label htmlFor="faq-search" className="sr-only">
        Search help topics
      </label>
      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-colors duration-200 group-focus-within:text-blue-500"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id="faq-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-12 pr-32 py-3.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600"
          role="searchbox"
          aria-label="Search frequently asked questions"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 hover:scale-105 active:scale-95"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            Clear
          </button>
        )}
      </div>
      {resultCount !== undefined && value.trim() && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 pl-1" aria-live="polite">
          {resultCount} result{resultCount === 1 ? '' : 's'} found
        </p>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FaqAccordion } from './FaqAccordion';

export interface FaqEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface HelpCategoryProps {
  title: string;
  description?: string;
  items: FaqEntry[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  searchQuery?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function HelpCategory({
  title,
  description,
  items,
  expandedId,
  onToggle,
  searchQuery = '',
  icon: Icon,
}: HelpCategoryProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4" aria-labelledby={`category-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
        )}
        <div>
          <h3
            id={`category-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="text-lg font-bold text-gray-900 dark:text-white"
          >
            {title}
          </h3>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
        <span className="ml-auto text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
          {items.length} {items.length === 1 ? 'topic' : 'topics'}
        </span>
      </div>

      <ul className="space-y-3 list-none p-0 m-0">
        {items.map((faq, index) => (
          <FaqAccordion
            key={faq.id}
            faq={faq}
            isOpen={expandedId === faq.id}
            onToggle={() => onToggle(faq.id)}
            index={index}
            searchQuery={searchQuery}
          />
        ))}
      </ul>
    </section>
  );
}

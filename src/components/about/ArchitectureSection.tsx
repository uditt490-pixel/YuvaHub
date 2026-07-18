import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { ArchitectureNode } from './types';
import { ARCHITECTURE_NODES } from './data';

// Single interactive architecture node card
function ArchitectureCard({ node, index }: { node: ArchitectureNode; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = node.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="bg-surface border border-border-theme rounded-[14px] overflow-hidden"
    >
      <button
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="w-full flex items-center gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring hover:bg-surface-secondary transition-colors"
      >
        {/* Icon */}
        <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 ${node.colorClass}`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>

        {/* Label */}
        <span className="flex-1 text-[15px] font-[600] text-text-primary">{node.label}</span>

        {/* Expand toggle */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted shrink-0"
        >
          <ChevronDown className="w-4 h-4" aria-hidden="true" />
        </motion.div>
      </button>

      {/* Expandable description */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-[13px] text-text-secondary leading-[1.65] border-t border-border-theme pt-4">
              {node.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ArchitectureSection() {
  return (
    <section
      className="px-6 lg:px-12 py-20 max-w-7xl mx-auto"
      aria-labelledby="architecture-heading"
    >
      {/* Section header */}
      <div className="text-center mb-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary-blue mb-3">
          How It's Built
        </p>
        <h2 id="architecture-heading" className="text-[28px] font-[700] text-text-primary mb-3">
          Platform Architecture
        </h2>
        <p className="text-[15px] text-text-secondary max-w-xl mx-auto">
          Click any layer to learn how the different parts of YuvaHub work together.
        </p>
      </div>

      {/* Interactive cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
        {ARCHITECTURE_NODES.map((node, i) => (
          <ArchitectureCard key={node.label} node={node} index={i} />
        ))}
      </div>
    </section>
  );
}

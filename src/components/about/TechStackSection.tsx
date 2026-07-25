import React from 'react';
import { motion } from 'motion/react';
import type { TechItem } from './types';
import { TECH_STACK } from './data';

// Single tech badge pill
function TechBadge({ item, index }: { item: TechItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`rounded-[10px] px-4 py-3 flex flex-col gap-0.5 ${item.colorClass}`}
    >
      <span className="text-[13px] font-[700]">{item.name}</span>
      <span className="text-[11px] opacity-70 font-medium">{item.role}</span>
    </motion.div>
  );
}

export default function TechStackSection() {
  return (
    <section
      id="tech-stack"
      className="px-6 lg:px-12 py-20 max-w-7xl mx-auto"
      aria-labelledby="techstack-heading"
    >
      {/* Section header */}
      <div className="text-center mb-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary-blue mb-3">
          Our Stack
        </p>
        <h2 id="techstack-heading" className="text-[28px] font-[700] text-text-primary mb-3">
          Technology Stack
        </h2>
        <p className="text-[15px] text-text-secondary max-w-xl mx-auto">
          Modern, open, and battle-tested — the tools we chose to build a platform that scales.
        </p>
      </div>

      {/* Tech badges — responsive wrapping grid */}
      <div className="flex flex-wrap gap-3 justify-center">
        {TECH_STACK.map((item, i) => (
          <TechBadge key={item.name} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}

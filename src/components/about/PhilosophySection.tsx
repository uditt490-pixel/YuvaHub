import React from 'react';
import { motion } from 'motion/react';
import type { PhilosophyPrinciple } from './types';
import { PHILOSOPHY_PRINCIPLES } from './data';

// Single development philosophy card
function PrincipleCard({ principle, index }: { principle: PhilosophyPrinciple; index: number }) {
  const Icon = principle.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="flex gap-4 p-5 bg-surface rounded-[14px] border border-border-theme shadow-sm hover:-translate-y-[2px] transition-all duration-200"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-[10px] bg-primary-blue/10 dark:bg-primary-blue/20 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-primary-blue" aria-hidden="true" />
      </div>

      {/* Text */}
      <div>
        <h3 className="text-[15px] font-[700] text-text-primary mb-1">{principle.title}</h3>
        <p className="text-[13px] text-text-secondary leading-[1.65]">{principle.description}</p>
      </div>
    </motion.div>
  );
}

export default function PhilosophySection() {
  return (
    <section
      className="bg-surface-secondary py-20 px-6 lg:px-12 transition-colors duration-250"
      aria-labelledby="philosophy-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary-blue mb-3">
            How We Work
          </p>
          <h2 id="philosophy-heading" className="text-[28px] font-[700] text-text-primary mb-3">
            Development Philosophy
          </h2>
          <p className="text-[15px] text-text-secondary max-w-xl mx-auto">
            The principles that guide every decision we make when building YuvaHub.
          </p>
        </div>

        {/* Principles grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
          {PHILOSOPHY_PRINCIPLES.map((principle, i) => (
            <PrincipleCard key={principle.title} principle={principle} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

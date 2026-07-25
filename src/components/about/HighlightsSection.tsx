import React from 'react';
import { motion } from 'motion/react';
import type { StatHighlight } from './types';
import { PLATFORM_HIGHLIGHTS } from './data';

// Single stat item in the highlights bar
function StatItem({ stat, index }: { stat: StatHighlight; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="text-center"
    >
      <div className="text-[40px] font-[800] text-white dark:text-text-primary">
        {stat.value}
      </div>
      <div className="text-[13px] uppercase tracking-[0.1em] text-white/80 dark:text-text-secondary mt-1 font-medium">
        {stat.label}
      </div>
    </motion.div>
  );
}

// Vertical divider between stats — hidden on mobile
function StatDivider() {
  return (
    <div
      aria-hidden="true"
      className="hidden md:block w-px h-[40px] bg-white/20 dark:bg-border-theme"
    />
  );
}

export default function HighlightsSection() {
  return (
    <section
      className="bg-primary-blue dark:bg-surface-secondary dark:border-y border-border-theme py-[52px] px-6 transition-colors duration-250"
      aria-label="Platform highlights"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-10 md:gap-[80px]">
        {PLATFORM_HIGHLIGHTS.map((stat, i) => (
          <React.Fragment key={stat.label}>
            <StatItem stat={stat} index={i} />
            {i < PLATFORM_HIGHLIGHTS.length - 1 && <StatDivider />}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

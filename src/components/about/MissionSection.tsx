import React from 'react';
import { motion } from 'motion/react';
import { Target } from 'lucide-react';

// Slide-in animation for the mission card
const slideIn = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
};

export default function MissionSection() {
  return (
    <section
      id="about"
      className="px-6 lg:px-12 py-20 max-w-7xl mx-auto"
      aria-labelledby="mission-heading"
    >
      <motion.div
        variants={slideIn}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55 }}
        className="bg-gradient-to-br from-primary-blue to-blue-700 dark:from-blue-700 dark:to-blue-900 rounded-[24px] p-10 lg:p-16 text-white flex flex-col lg:flex-row items-start gap-10 shadow-xl shadow-primary-blue/20"
      >
        {/* Icon column */}
        <div className="shrink-0">
          <div className="w-16 h-16 rounded-[18px] bg-white/15 flex items-center justify-center">
            <Target className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
        </div>

        {/* Content column */}
        <div>
          <h2 id="mission-heading" className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/70 mb-3">
            Our Mission
          </h2>
          <p className="text-[28px] lg:text-[34px] font-[800] leading-[1.2] mb-5">
            Democratise career access for every Indian student, regardless of tier or background.
          </p>
          <p className="text-[16px] text-white/80 leading-[1.75] max-w-2xl">
            Millions of talented students in India miss career-defining opportunities simply because
            they don't know they exist. YuvaHub fixes that by aggregating opportunities from
            across the internet, enriching them with AI, and delivering a personalised feed to
            every student — completely free.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

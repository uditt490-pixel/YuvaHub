import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface AboutHeroProps {
  /** Called when the CTA button is clicked */
  onCtaClick: () => void;
}

// Fade-up animation applied to the hero text block
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function AboutHero({ onCtaClick }: AboutHeroProps) {
  return (
    <section
      className="relative px-6 lg:px-12 py-20 lg:py-32 max-w-7xl mx-auto text-center overflow-hidden"
      aria-labelledby="about-hero-heading"
    >
      {/* Decorative background blobs — purely visual, hidden from screen readers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-primary-blue/5 dark:bg-primary-blue/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] rounded-full bg-orange-cta/5 dark:bg-orange-cta/10 blur-3xl" />
      </div>

      {/* Eyebrow tag */}
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.5 }}
        className="inline-block px-3 py-1 bg-orange-cta/10 border border-orange-cta/20 text-orange-cta text-[11px] font-bold uppercase tracking-wide rounded-full mb-6"
      >
        <Sparkles className="inline w-3 h-3 mr-1 -mt-0.5" aria-hidden="true" />
        Built for India's Next Generation
      </motion.div>

      {/* Main heading */}
      <motion.h1
        id="about-hero-heading"
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-[40px] sm:text-[52px] font-[800] leading-[1.1] text-text-primary mb-6"
      >
        The Platform That Connects <br className="hidden sm:block" />
        <span className="text-primary-blue italic">Ambitious Students</span> to{' '}
        <span className="text-orange-cta italic">Real Opportunities</span>
      </motion.h1>

      {/* Sub-heading */}
      <motion.p
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-[17px] text-text-secondary leading-[1.7] max-w-2xl mx-auto mb-10"
      >
        YuvaHub is an AI-powered career platform helping Indian students discover internships,
        scholarships, hackathons, and jobs — with the tools, mentors, and community to land them.
      </motion.p>

      {/* CTA */}
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <button
          onClick={onCtaClick}
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary-blue text-white text-[15px] font-bold rounded-[10px] hover:brightness-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background shadow-lg shadow-primary-blue/20"
        >
          Join YuvaHub Free
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
        <a
          href="https://github.com/yuvahuborg"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-7 py-3.5 border border-border-theme text-text-primary text-[15px] font-medium rounded-[10px] hover:bg-surface-secondary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          View on GitHub
        </a>
      </motion.div>
    </section>
  );
}

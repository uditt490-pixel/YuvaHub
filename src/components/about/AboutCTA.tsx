import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Github } from 'lucide-react';

interface AboutCTAProps {
  /** Called when the primary join button is clicked */
  onJoinClick: () => void;
}

export default function AboutCTA({ onJoinClick }: AboutCTAProps) {
  return (
    <section
      className="px-6 lg:px-12 py-24 max-w-7xl mx-auto text-center"
      aria-labelledby="cta-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55 }}
        className="bg-surface rounded-[24px] border border-border-theme p-12 lg:p-16 shadow-sm"
      >
        {/* Eyebrow */}
        <div className="inline-block px-3 py-1 bg-primary-blue/10 border border-primary-blue/20 text-primary-blue text-[11px] font-bold uppercase tracking-wide rounded-full mb-6">
          Ready to Start?
        </div>

        {/* Heading */}
        <h2 id="cta-heading" className="text-[32px] lg:text-[40px] font-[800] text-text-primary leading-[1.15] mb-5">
          Your Next Opportunity is <br className="hidden sm:block" />
          <span className="text-primary-blue italic">One Search Away</span>
        </h2>

        {/* Sub-copy */}
        <p className="text-[16px] text-text-secondary leading-[1.7] max-w-xl mx-auto mb-10">
          Join thousands of Indian students who use YuvaHub every day to discover internships,
          win hackathons, and land their dream jobs.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onJoinClick}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-blue text-white text-[15px] font-bold rounded-[10px] hover:brightness-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background shadow-lg shadow-primary-blue/20"
          >
            Join YuvaHub — It's Free
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>

          <a
            href="https://github.com/yuvahuborg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 border border-border-theme text-text-primary text-[15px] font-medium rounded-[10px] hover:bg-surface-secondary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <Github className="w-5 h-5" aria-hidden="true" />
            Contribute on GitHub
          </a>
        </div>
      </motion.div>
    </section>
  );
}

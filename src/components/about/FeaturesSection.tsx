import React from 'react';
import { motion } from 'motion/react';
import type { FeatureCard } from './types';
import { FEATURE_CARDS } from './data';

// Single feature card — extracted to keep the grid mapping clean
function FeatureItem({ feature, index }: { feature: FeatureCard; index: number }) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="bg-surface rounded-[14px] p-7 flex flex-col shadow-sm border border-border-theme transition-all duration-200 hover:-translate-y-[2px] hover:border-primary-blue hover:shadow-[0_0_0_3px_var(--focus-ring)]"
    >
      <div className={`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center mb-5 ${feature.colorClass}`}>
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-[16px] font-[700] text-text-primary mb-2">{feature.title}</h3>
      <p className="text-[14px] text-text-secondary leading-[1.65]">{feature.description}</p>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-surface-secondary py-20 px-6 lg:px-12 transition-colors duration-250"
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary-blue mb-3">
            What We Offer
          </p>
          <h2 id="features-heading" className="text-[28px] font-[700] text-text-primary mb-3">
            Everything a Student Needs
          </h2>
          <p className="text-[15px] text-text-secondary max-w-xl mx-auto">
            From discovery to application, YuvaHub covers the full career journey in one place.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px]">
          {FEATURE_CARDS.map((feature, i) => (
            <FeatureItem key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

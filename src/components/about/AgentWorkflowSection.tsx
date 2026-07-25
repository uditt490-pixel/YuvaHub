import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import type { AgentStep } from './types';
import { AGENT_STEPS } from './data';

// Single step in the multi-agent workflow diagram
function WorkflowStep({ step, isLast }: { step: AgentStep; isLast: boolean }) {
  return (
    <div className="flex flex-col items-center">
      {/* Step card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.4, delay: step.step * 0.08 }}
        className={`w-full rounded-[14px] border p-5 ${step.colorClass}`}
      >
        {/* Agent badge + name */}
        <div className="flex items-center gap-3 mb-3">
          <span className="w-7 h-7 rounded-full bg-white/40 dark:bg-black/20 text-[12px] font-[800] flex items-center justify-center shrink-0">
            {step.step}
          </span>
          <h3 className="text-[15px] font-[700]">{step.agent}</h3>
        </div>

        {/* What the agent does */}
        <p className="text-[13px] leading-[1.6] opacity-80 mb-2">
          <span className="font-semibold">Action: </span>{step.action}
        </p>

        {/* What it produces */}
        <p className="text-[12px] leading-[1.5] opacity-70">
          <span className="font-semibold">Output: </span>{step.output}
        </p>
      </motion.div>

      {/* Connector arrow between steps */}
      {!isLast && (
        <div className="my-3 text-muted" aria-hidden="true">
          <ArrowDown className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}

export default function AgentWorkflowSection() {
  return (
    <section
      id="how-it-works"
      className="bg-surface-secondary py-20 px-6 lg:px-12 transition-colors duration-250"
      aria-labelledby="agents-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary-blue mb-3">
            Under the Hood
          </p>
          <h2 id="agents-heading" className="text-[28px] font-[700] text-text-primary mb-3">
            Multi-Agent Workflow
          </h2>
          <p className="text-[15px] text-text-secondary max-w-xl mx-auto">
            YuvaHub uses a chain of specialised AI agents to discover, enrich, and deliver
            opportunities to students automatically.
          </p>
        </div>

        {/* Two-column layout: pipeline on left, context on right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">

          {/* Agent step pipeline */}
          <div className="flex flex-col">
            {AGENT_STEPS.map((step, i) => (
              <WorkflowStep
                key={step.agent}
                step={step}
                isLast={i === AGENT_STEPS.length - 1}
              />
            ))}
          </div>

          {/* Sticky context panel */}
          <div className="lg:sticky lg:top-[80px]">
            <div className="bg-surface border border-border-theme rounded-[18px] p-7 shadow-sm">
              <h3 className="text-[16px] font-[700] text-text-primary mb-4">
                Why Agents?
              </h3>
              <ul className="flex flex-col gap-4 text-[14px] text-text-secondary leading-[1.65]">
                <li className="flex gap-3">
                  <span className="text-primary-blue font-bold shrink-0 mt-0.5" aria-hidden="true">→</span>
                  Each agent has a single responsibility, making the pipeline easy to test and extend.
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-blue font-bold shrink-0 mt-0.5" aria-hidden="true">→</span>
                  The enrichment step uses Gemini to add structured metadata that no scraper can produce alone.
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-blue font-bold shrink-0 mt-0.5" aria-hidden="true">→</span>
                  BullMQ queues ensure jobs are retried on failure — no opportunity is lost due to a transient error.
                </li>
                <li className="flex gap-3">
                  <span className="text-primary-blue font-bold shrink-0 mt-0.5" aria-hidden="true">→</span>
                  The Apply Assist agent runs on-demand, so it never wastes compute unless a student asks for help.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

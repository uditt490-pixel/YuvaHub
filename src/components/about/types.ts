import { LucideIcon } from 'lucide-react';

// ─── Shared data shape interfaces ────────────────────────────────────────────

export interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
  colorClass: string;
}

export interface ArchitectureNode {
  label: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
}

export interface AgentStep {
  step: number;
  agent: string;
  action: string;
  output: string;
  colorClass: string;
}

export interface TechItem {
  name: string;
  role: string;
  colorClass: string;
}

export interface PhilosophyPrinciple {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface StatHighlight {
  value: string;
  label: string;
}

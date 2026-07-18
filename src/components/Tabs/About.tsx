import React from 'react';
import { useAppContext } from '../../context/AppContext';

// About page section components
import AboutHero from '../about/AboutHero';
import MissionSection from '../about/MissionSection';
import FeaturesSection from '../about/FeaturesSection';
import ArchitectureSection from '../about/ArchitectureSection';
import AgentWorkflowSection from '../about/AgentWorkflowSection';
import TechStackSection from '../about/TechStackSection';
import PhilosophySection from '../about/PhilosophySection';
import HighlightsSection from '../about/HighlightsSection';
import AboutCTA from '../about/AboutCTA';

/**
 * About tab — rendered inside the authenticated app shell.
 * Accessible via Settings → "About YuvaHub" link.
 *
 * Re-uses the same section components as the public About page
 * so content stays in sync with zero duplication.
 */
export default function AboutTab() {
  const { setActiveTab } = useAppContext();

  // CTA navigates to the main dashboard
  const handleCtaClick = () => {
    setActiveTab('dashboard');
  };

  return (
    <div className="bg-background text-text-primary min-h-screen overflow-x-hidden transition-colors duration-250">
      <AboutHero onCtaClick={handleCtaClick} />
      <MissionSection />
      <FeaturesSection />
      <ArchitectureSection />
      <AgentWorkflowSection />
      <TechStackSection />
      <PhilosophySection />
      <HighlightsSection />
      <AboutCTA onJoinClick={handleCtaClick} />
    </div>
  );
}

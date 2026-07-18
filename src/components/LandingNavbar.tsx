import React, { useState } from 'react';
import { Zap, Sun, Moon, Menu, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface LandingNavbarProps {
  /** Called when the user clicks Login */
  onLoginClick: () => void;
  /** Called when a nav anchor link is clicked (scroll target id) */
  onNavClick?: (id: string) => void;
}

interface NavLink {
  label: string;
  href: string;
}

// Top navigation links for the public landing experience
const NAV_LINKS: NavLink[] = [
  { label: 'Features', href: 'features' },
  { label: 'How It Works', href: 'how-it-works' },
  { label: 'Tech Stack', href: 'tech-stack' },
  { label: 'About', href: 'about' },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function LandingNavbar({ onLoginClick, onNavClick }: LandingNavbarProps) {
  const { theme, toggleTheme } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    if (onNavClick) {
      onNavClick(href);
    } else {
      scrollToSection(href);
    }
  };

  return (
    <header className="sticky top-0 z-50 h-[60px] bg-navbar border-b border-border-theme flex items-center justify-between px-6 lg:px-12 transition-colors duration-250">
      {/* Brand mark */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary-blue flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-[17px] tracking-tight text-text-primary">YuvaHub</span>
      </div>

      {/* Desktop nav links */}
      <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-text-secondary" aria-label="Main navigation">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={`#${link.href}`}
            onClick={(e) => handleNavClick(e, link.href)}
            className="hover:text-primary-blue transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={onLoginClick}
          className="px-5 py-2 text-[14px] font-medium bg-primary-blue text-white rounded-[8px] hover:brightness-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Get Started
        </button>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div
          className="md:hidden absolute top-[60px] left-0 right-0 bg-navbar border-b border-border-theme shadow-md z-50 px-6 py-4 flex flex-col gap-4"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={`#${link.href}`}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-[15px] font-medium text-text-secondary hover:text-primary-blue transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => { setMobileOpen(false); onLoginClick(); }}
            className="mt-2 px-5 py-2.5 text-[14px] font-medium bg-primary-blue text-white rounded-[8px] hover:brightness-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring text-left"
          >
            Get Started
          </button>
        </div>
      )}
    </header>
  );
}

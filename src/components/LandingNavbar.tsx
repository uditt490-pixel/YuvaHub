import React, { useState } from 'react';
import { Zap, Sun, Moon, Menu, X, ArrowLeft } from 'lucide-react';
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

const NAV_LINKS: NavLink[] = [
  { label: 'Explore', href: 'explore' },
  { label: 'AI Suite', href: 'features' },
  { label: 'Impact', href: 'stats' },
  { label: 'FAQ', href: 'faq' },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function LandingNavbar({ onLoginClick, onNavClick }: LandingNavbarProps) {
  const { activeTab, setActiveTab, theme, toggleTheme } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
      setTimeout(() => {
        if (onNavClick) onNavClick(href);
        else scrollToSection(href);
      }, 50);
    } else {
      if (onNavClick) onNavClick(href);
      else scrollToSection(href);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#fcf9f2]/90 backdrop-blur-md border-b border-[#e8ded1] transition-colors duration-300">
      <div className="max-w-7xl mx-auto h-[72px] px-6 lg:px-12 flex items-center justify-between">
        
        {/* Brand Mark */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => {
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="w-9 h-9 rounded-full bg-[#603620] flex items-center justify-center shadow-md">
            <Zap className="w-4 h-4 text-[#f3e4bd]" />
          </div>
          <span className="font-serif font-bold text-2xl tracking-tight text-[#231f20]">
            Yuva<span className="text-[#b56b37] italic">Hub</span>
          </span>
        </div>

        {/* Desktop Nav Links or Back Button */}
        {activeTab === 'dashboard' ? (
          <nav className="hidden md:flex items-center gap-10 text-xs uppercase tracking-widest font-bold text-[#603620]">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={`#${link.href}`}
                onClick={(e) => handleNavClick(e, link.href)}
                className="hover:text-[#b56b37] transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>
        ) : (
          <button
            onClick={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#b56b37] hover:text-[#603620] transition-colors bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">

          <button
            onClick={onLoginClick}
            className="hidden md:block px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider bg-[#b56b37] text-white rounded-full shadow-md hover:bg-[#603620] transition-all cursor-pointer"
          >
            Sign In
          </button>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-[#603620] rounded-xl hover:bg-[#f3e4bd]/50"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#fcf9f2] border-b border-[#e8ded1] shadow-xl px-6 py-6 flex flex-col gap-4">
          {activeTab === 'dashboard' ? (
            NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={`#${link.href}`}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-bold uppercase tracking-wider text-[#603620] hover:text-[#b56b37]"
              >
                {link.label}
              </a>
            ))
          ) : (
            <button
              onClick={() => {
                setMobileOpen(false);
                setActiveTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-sm font-bold uppercase tracking-wider text-[#b56b37] flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
          )}
          <button
            onClick={() => { setMobileOpen(false); onLoginClick(); }}
            className="mt-2 w-full py-3 text-xs font-extrabold uppercase tracking-wider bg-[#b56b37] text-white rounded-full shadow-md text-center"
          >
            Sign In / Register
          </button>
        </div>
      )}
    </header>
  );
}

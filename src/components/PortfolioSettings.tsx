import React, { useState } from 'react';
import { Layout, Terminal as TerminalIcon, Globe, Save, ExternalLink, Eye } from 'lucide-react';

// Import our templates and mock data
import Minimalist from './portfolio-templates/Minimalist';
import TerminalTheme from './portfolio-templates/TerminalTheme';
import mockData from '../data/mockPortfolio.json';

const PortfolioSettings = () => {
  const [activeTheme, setActiveTheme] = useState('minimalist');

  const renderPreview = () => {
    switch (activeTheme) {
      case 'terminal':
        return <TerminalTheme userData={mockData} />;
      case 'minimalist':
      default:
        return <Minimalist userData={mockData} />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            Portfolio Generator
          </h2>
          <p className="text-sm text-gray-500 mt-1">Customize how recruiters see your public profile.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <ExternalLink className="w-4 h-4" />
            Preview Live
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Save className="w-4 h-4" />
            Publish Portfolio
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Controls */}
        <div className="w-80 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shrink-0">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Choose Template</h3>
          
          <div className="space-y-4">
            {/* Minimalist Option */}
            <label className={`block cursor-pointer border-2 rounded-xl p-4 transition-all ${activeTheme === 'minimalist' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="theme" 
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  checked={activeTheme === 'minimalist'}
                  onChange={() => setActiveTheme('minimalist')}
                />
                <Layout className={`w-5 h-5 ${activeTheme === 'minimalist' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`font-semibold ${activeTheme === 'minimalist' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  Minimalist
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-7">Clean, modern, and highly readable. Best for corporate roles.</p>
            </label>

            {/* Terminal Option */}
            <label className={`block cursor-pointer border-2 rounded-xl p-4 transition-all ${activeTheme === 'terminal' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}>
              <div className="flex items-center gap-3">
                <input 
                  type="radio" 
                  name="theme" 
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  checked={activeTheme === 'terminal'}
                  onChange={() => setActiveTheme('terminal')}
                />
                <TerminalIcon className={`w-5 h-5 ${activeTheme === 'terminal' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`font-semibold ${activeTheme === 'terminal' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  Terminal / CLI
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-7">Dark mode hacker aesthetic. Perfect for software engineers.</p>
            </label>
          </div>
        </div>

        {/* Right Area - Live Preview */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-100 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-500">Live Preview</span>
            </div>
            
            {/* The Mock Browser Window */}
            <div className="bg-white dark:bg-black rounded-t-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center px-4 py-3 gap-2">
               <div className="flex gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
               <div className="ml-4 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs text-gray-500 font-mono flex-1 text-center truncate">
                 yuvahub.xyz/portfolio/alexdeveloper
               </div>
            </div>
            
            {/* Template Render Area */}
            <div className="border-x border-b border-gray-200 dark:border-gray-800 rounded-b-xl overflow-hidden shadow-xl bg-white h-[800px] overflow-y-auto">
              {renderPreview()}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSettings;

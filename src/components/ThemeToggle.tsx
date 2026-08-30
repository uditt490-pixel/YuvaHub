import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div 
      className="flex items-center space-x-1 bg-surface-secondary border border-border-theme p-1 rounded-lg"
      role="group"
      aria-label="Theme Preferences"
    >
      <button
        onClick={() => setTheme('light')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring ${
          theme === 'light' 
            ? 'bg-surface shadow-sm text-primary-blue' 
            : 'text-text-secondary hover:text-text-primary'
        }`}
        aria-pressed={theme === 'light'}
        aria-label="Enable light mode"
      >
        Light
      </button>
      
      <button
        onClick={() => setTheme('dark')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring ${
          theme === 'dark' 
            ? 'bg-surface shadow-sm text-primary-blue' 
            : 'text-text-secondary hover:text-text-primary'
        }`}
        aria-pressed={theme === 'dark'}
        aria-label="Enable dark mode"
      >
        Dark
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring ${
          theme === 'system' 
            ? 'bg-surface shadow-sm text-primary-blue' 
            : 'text-text-secondary hover:text-text-primary'
        }`}
        aria-pressed={theme === 'system'}
        aria-label="Enable system default theme"
      >
        System
      </button>
    </div>
  );
};

export default ThemeToggle;

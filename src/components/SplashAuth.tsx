import React, { useState } from 'react';
import { Sparkles, Globe, BrainCircuit, Search, Zap, Code, Lightbulb, Trophy, Target, ArrowRight, Mail, X, Github, Sun, Moon } from 'lucide-react';
import { signInWithGoogle, signInWithGithub } from '../lib/firebase';
import { useAppContext } from '../context/AppContext';

export default function SplashAuth() {
  const { setActiveTab, theme, toggleTheme } = useAppContext();
  const [loading, setLoading] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading('google');
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    setLoading('github');
    try {
      await signInWithGithub();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const handleLogin = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-text-primary overflow-x-hidden transition-colors duration-250">
      {/* Navbar */}
      <header className="sticky top-0 z-50 h-[60px] bg-navbar border-b border-border-theme flex items-center justify-between px-6 lg:px-12 transition-colors duration-250">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-blue flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-[17px] tracking-tight text-text-primary">YuvaHub</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-text-secondary">
          <a href="#explore" onClick={(e) => { e.preventDefault(); document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-primary-blue transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Learn</a>
          <a href="#competitions" onClick={(e) => { e.preventDefault(); document.getElementById('competitions')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-primary-blue transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Compete</a>
          <a href="#stats" onClick={(e) => { e.preventDefault(); document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-primary-blue transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Jobs</a>
          <a href="#footer" onClick={(e) => { e.preventDefault(); document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-primary-blue transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Mentorship</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="hidden sm:block px-4 py-2 text-[14px] font-medium border border-border-theme text-text-primary rounded-[8px] hover:bg-surface-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
            Host Event
          </button>
          <button onClick={handleLogin} disabled={loading !== null} className="px-5 py-2 text-[14px] font-medium bg-primary-blue text-white rounded-[8px] hover:brightness-110 transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            {loading !== null ? 'Wait...' : 'Login'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-block px-3 py-1 bg-orange-cta/10 border border-orange-cta/20 text-orange-cta text-[11px] font-bold uppercase tracking-wide rounded-full mb-6">
            ⚡ Connecting Talent to Opportunity
          </div>
          <h1 className="text-[46px] font-[800] leading-[1.12] text-text-primary mb-6 transition-colors duration-250">
            Unlock Your <span className="text-primary-blue italic">Career</span> Potential
          </h1>
          <p className="text-[16px] text-text-secondary leading-[1.65] mb-8 max-w-lg transition-colors duration-250">
            Join the premier network matching ambitious students with real-world competitions, hackathons, and tech roles globally.
          </p>
          
          <div className="relative max-w-md shadow-[0_10px_30px_var(--shadow-color)] border border-border-theme rounded-[10px] bg-surface flex items-center p-1 mb-6 transition-colors duration-250 focus-within:ring-2 focus-within:ring-focus-ring">
            <Search className="w-5 h-5 text-muted ml-3 shrink-0" />
            <input 
              type="text" 
              placeholder="Search companies, competitions, jobs..." 
              className="flex-1 bg-transparent border-none outline-none text-[13px] px-3 py-2 text-text-primary placeholder:text-muted"
            />
            <button onClick={handleLogin} className="bg-search-btn text-white text-[13px] font-bold px-5 py-[13px] rounded-[6px] hover:brightness-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              Search
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12px] font-medium text-muted">Trending:</span>
            {['Generative AI', 'Web3', 'Product Management', 'Data Science'].map(t => (
              <span key={t} className="px-3 py-1 bg-surface-secondary border border-border-theme text-text-secondary text-[12px] rounded-[100px] hover:brightness-90 dark:hover:brightness-110 transition-colors cursor-pointer">
                {t}
              </span>
            ))}
          </div>
        </div>
        
        <div className="relative h-[400px] w-full rounded-[20px] bg-gradient-to-br from-[#EFF6FF] to-[#F0FDF4] shadow-lg border border-white flex items-center justify-center p-8">
           <div className="absolute top-[10%] left-[10%] z-20 w-[120px] bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 animate-float" style={{ animationDelay: '0s' }}>
        <div className="relative h-[400px] w-full rounded-[20px] bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/20 shadow-lg border border-border-theme flex items-center justify-center p-8 transition-colors duration-250">
           <div className="absolute top-[10%] left-[10%] w-[120px] bg-surface p-3 rounded-xl shadow-[0_10px_30px_var(--shadow-color)] border border-border-theme flex flex-col items-center gap-2 animate-float" style={{ animationDelay: '0s' }}>
              <span className="text-3xl">🚀</span>
              <span className="text-[10px] font-bold text-text-primary">Landed job at Google</span>
           </div>
           <div className="absolute bottom-[20%] right-[5%] z-20 w-[130px] bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 animate-float" style={{ animationDelay: '0.8s' }}>
           <div className="absolute bottom-[20%] right-[5%] w-[130px] bg-surface p-3 rounded-xl shadow-[0_10px_30px_var(--shadow-color)] border border-border-theme flex flex-col items-center gap-2 animate-float" style={{ animationDelay: '0.8s' }}>
              <span className="text-3xl">🏆</span>
              <span className="text-[10px] font-bold text-text-primary">Won ETHGlobal</span>
           </div>
           <div className="absolute top-[20%] right-[12%] z-20 w-[100px] bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 animate-float" style={{ animationDelay: '1.5s' }}>
           <div className="absolute top-[40%] right-[15%] w-[100px] bg-surface p-3 rounded-xl shadow-[0_10px_30px_var(--shadow-color)] border border-border-theme flex flex-col items-center gap-2 animate-float" style={{ animationDelay: '1.5s' }}>
              <span className="text-3xl">💡</span>
              <span className="text-[10px] font-bold text-text-primary">Top 10 Finalist</span>
           </div>
           <div className="w-64 h-64 bg-surface/40 backdrop-blur-md rounded-full absolute border border-border-theme/60"></div>
        </div>
      </section>

      {/* Explore Your Interest */}
      <section id="explore" className="bg-surface-secondary py-20 px-6 lg:px-12 transition-colors duration-250">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[28px] font-[700] text-text-primary mb-3 transition-colors duration-250">Explore Your Interest</h2>
            <p className="text-[15px] text-text-secondary transition-colors duration-250">Find standard competitions tailored to your skills and domain.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
             {[ 
               { title: 'Coding & Tech', sub: 'Hackathons, DSA', icon: Code, colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
               { title: 'Business & Mgmt', sub: 'Case studies', icon: Lightbulb, colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
               { title: 'Design & UX', sub: 'UI/UX Challenges', icon: Target, colorClass: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
               { title: 'Cultural & Arts', sub: 'Festivals, Media', icon: Sparkles, colorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' }
             ].map((cat, i) => (
                <div key={i} className="bg-surface rounded-[14px] p-7 flex flex-col items-center text-center shadow-sm border border-border-theme transition-all duration-200 hover:-translate-y-[2px] hover:border-primary-blue hover:shadow-[0_0_0_3px_var(--focus-ring)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring" tabIndex={0}>
                   <div className={`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center mb-4 ${cat.colorClass}`}>
                      <cat.icon className="w-6 h-6" />
                   </div>
                   <h3 className="text-[15px] font-[600] text-text-primary mb-1">{cat.title}</h3>
                   <p className="text-[12px] text-text-secondary">{cat.sub}</p>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Featured Competitions */}
      <section id="competitions" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
         <div className="flex items-center justify-between mb-10">
            <h2 className="text-[28px] font-[700] text-text-primary transition-colors duration-250">Featured Competitions</h2>
            <button onClick={handleLogin} className="text-primary-blue font-bold text-[14px] hover:underline flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">View All <ArrowRight className="w-4 h-4" /></button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
            {/* Card 1 */}
            <div className="bg-surface border border-border-theme rounded-[12px] overflow-hidden shadow-[0_10px_30px_var(--shadow-color)] hover:shadow-lg hover:-translate-y-[3px] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring" tabIndex={0}>
               <div className="h-[150px] bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] flex items-center justify-center relative p-4">
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#16A34A] text-white text-[10px] font-bold uppercase rounded-full">LIVE</div>
                  <h3 className="text-white text-xl font-black tracking-widest text-center opacity-80 mt-2">HACKATHON 2024</h3>
               </div>
               <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-[22px] h-[22px] rounded-[5px] bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold">ML</div>
                     <span className="text-[13px] text-text-secondary font-medium">Major League Hacking</span>
                  </div>
                  <h4 className="text-[15px] font-[600] text-text-primary mb-3 line-clamp-2">Global Innovation Challenge: AI & Web3</h4>
                  <div className="flex items-center text-[12px] text-text-secondary justify-between">
                     <span>📅 Apr 15 - Apr 17</span>
                     <span>👥 1,204 Registered</span>
                  </div>
               </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface border border-border-theme rounded-[12px] overflow-hidden shadow-[0_10px_30px_var(--shadow-color)] hover:shadow-lg hover:-translate-y-[3px] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring" tabIndex={0}>
               <div className="h-[150px] bg-surface-secondary flex items-center justify-center relative p-4">
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#F97316] text-white text-[10px] font-bold uppercase rounded-full">PREMIUM</div>
                  <Trophy className="w-16 h-16 text-muted opacity-50" />
               </div>
               <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-[22px] h-[22px] rounded-[5px] bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 flex items-center justify-center text-[10px] font-bold">ST</div>
                     <span className="text-[13px] text-text-secondary font-medium">Stanford Univ</span>
                  </div>
                  <h4 className="text-[15px] font-[600] text-text-primary mb-3 line-clamp-2">Stanford Business Case Competition 2025</h4>
                  <div className="flex items-center text-[12px] text-text-secondary justify-between">
                     <span>📅 May 01 - May 05</span>
                     <span>👥 850 Registered</span>
                  </div>
               </div>
            </div>

            {/* Card 3 */}
            <div className="bg-surface border border-border-theme rounded-[12px] overflow-hidden shadow-[0_10px_30px_var(--shadow-color)] hover:shadow-lg hover:-translate-y-[3px] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring" tabIndex={0}>
               <div className="h-[150px] bg-surface-secondary flex items-center justify-center relative p-4">
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#16A34A] text-white text-[10px] font-bold uppercase rounded-full">FREE</div>
                  <Target className="w-16 h-16 text-muted opacity-50" />
               </div>
               <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-[22px] h-[22px] rounded-[5px] bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 flex items-center justify-center text-[10px] font-bold">GO</div>
                     <span className="text-[13px] text-text-secondary font-medium">Google Developer Groups</span>
                  </div>
                  <h4 className="text-[15px] font-[600] text-text-primary mb-3 line-clamp-2">Solution Challenge India Regional</h4>
                  <div className="flex items-center text-[12px] text-text-secondary justify-between">
                     <span>📅 Mar 10 - Jun 20</span>
                     <span>👥 5,200 Registered</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Stats Bar */}
      <section id="stats" className="bg-primary-blue dark:bg-surface-secondary dark:border-y border-border-theme py-[52px] px-6 transition-colors duration-250">
         <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-10 md:gap-[80px] text-center">
            <div>
               <div className="text-[40px] font-[800] text-white dark:text-text-primary">5M+</div>
               <div className="text-[13px] uppercase tracking-[0.1em] text-white/80 dark:text-text-secondary mt-1 font-medium">Users</div>
            </div>
            <div className="hidden md:block w-px h-[40px] bg-white/20 dark:bg-border-theme"></div>
            <div>
               <div className="text-[40px] font-[800] text-white dark:text-text-primary">100k+</div>
               <div className="text-[13px] uppercase tracking-[0.1em] text-white/80 dark:text-text-secondary mt-1 font-medium">Events</div>
            </div>
            <div className="hidden md:block w-px h-[40px] bg-white/20 dark:bg-border-theme"></div>
            <div>
               <div className="text-[40px] font-[800] text-white dark:text-text-primary">2k+</div>
               <div className="text-[13px] uppercase tracking-[0.1em] text-white/80 dark:text-text-secondary mt-1 font-medium">Companies</div>
            </div>
            <div className="hidden md:block w-px h-[40px] bg-white/20 dark:bg-border-theme"></div>
            <div>
               <div className="text-[40px] font-[800] text-white dark:text-text-primary">500k+</div>
               <div className="text-[13px] uppercase tracking-[0.1em] text-white/80 dark:text-text-secondary mt-1 font-medium">Hired</div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-background pt-20 pb-8 px-6 lg:px-12 max-w-7xl mx-auto transition-colors duration-250">
         <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_2fr] gap-10 mb-16">
            <div className="max-w-[220px]">
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-primary-blue flex items-center justify-center">
                     <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-bold text-[15px] tracking-tight text-text-primary">YuvaHub</span>
               </div>
               <p className="text-[13px] text-text-secondary leading-relaxed">
                 Connecting the world's brightest minds to the most challenging opportunities globally.
               </p>
            </div>
            
            <div className="flex flex-col gap-[9px]">
               <h4 className="font-bold text-text-primary mb-2">Competitions</h4>
               <a href="#" className="text-[13px] text-text-secondary hover:text-primary-blue transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Hackathons</a>
               <a href="#" className="text-[13px] text-text-secondary hover:text-primary-blue transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Quizzes</a>
               <a href="#" className="text-[13px] text-text-secondary hover:text-primary-blue transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Hiring Challenges</a>
               <a href="#" className="text-[13px] text-text-secondary hover:text-primary-blue transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Case Studies</a>
            </div>

            <div className="flex flex-col gap-[9px]">
               <h4 className="font-bold text-text-primary mb-2">Opportunities</h4>
               <a href="#" className="text-[13px] text-text-secondary hover:text-primary-blue transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Internships</a>
               <a href="#" className="text-[13px] text-text-secondary hover:text-primary-blue transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Full Time Jobs</a>
               <a href="#" className="text-[13px] text-text-secondary hover:text-primary-blue transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Scholarships</a>
               <a href="#" className="text-[13px] text-text-secondary hover:text-primary-blue transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Fellowships</a>
            </div>

            <div>
               <h4 className="font-bold text-text-primary mb-2">Stay Updated</h4>
               <p className="text-[13px] text-text-secondary mb-4">Get the latest opportunities right in your inbox.</p>
               <div className="flex border border-border-theme rounded-[8px] overflow-hidden focus-within:border-primary-blue focus-within:ring-1 focus-within:ring-primary-blue transition-all bg-surface">
                  <div className="flex items-center pl-3">
                     <Mail className="w-4 h-4 text-muted" />
                  </div>
                  <input type="email" placeholder="Email address" className="flex-1 text-[13px] px-3 py-2.5 outline-none bg-transparent text-text-primary placeholder:text-muted" />
                  <button className="bg-primary-blue text-white px-4 py-2.5 text-[13px] font-bold hover:brightness-110 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white">Join</button>
               </div>
            </div>
         </div>

         <div className="pt-6 border-t border-border-theme flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-[13px] text-text-secondary">&copy; 2026 YuvaHub Inc. All rights reserved.</span>
            <div className="flex flex-wrap gap-6">
               {/* About link — navigates to the About page even before login */}
               <button onClick={() => setActiveTab('about')} className="text-[13px] text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer p-0 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">About Us</button>
               <button onClick={() => setActiveTab('privacy')} className="text-[13px] text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer p-0 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Privacy Policy</button>
               <button onClick={() => setActiveTab('terms')} className="text-[13px] text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer p-0 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Terms of Service</button>
               <button onClick={() => setActiveTab('cookies')} className="text-[13px] text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer p-0 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Cookie Policy</button>
               <button onClick={() => setActiveTab('guidelines')} className="text-[13px] text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer p-0 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Guidelines</button>
               <button onClick={() => setActiveTab('security')} className="text-[13px] text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer p-0 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Security</button>
               <button onClick={() => setActiveTab('support')} className="text-[13px] text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer p-0 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded">Support & Feedback</button>
            </div>
         </div>
       </footer>

      {/* Login Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[20px] w-full max-w-md shadow-[0_10px_30px_var(--shadow-color)] p-8 border border-border-theme relative animate-fade-in">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-secondary border border-border-theme flex items-center justify-center text-text-secondary hover:text-text-primary hover:brightness-90 dark:hover:brightness-110 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary-blue flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-blue/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Welcome to YuvaHub</h3>
              <p className="text-sm text-text-secondary">Sign in to unlock personalized opportunities, AI mentoring, and discussion boards.</p>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={handleGoogleLogin} 
                disabled={loading !== null} 
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 border border-border-theme hover:brightness-95 dark:hover:brightness-110 rounded-[12px] bg-surface text-text-primary font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span>{loading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
              </button>

              <button 
                onClick={handleGithubLogin} 
                disabled={loading !== null} 
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 border border-border-theme hover:brightness-110 rounded-[12px] bg-[#24292F] dark:bg-surface-secondary text-white font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <Github className="w-5 h-5 text-white shrink-0" />
                <span>{loading === 'github' ? 'Connecting...' : 'Continue with GitHub'}</span>
              </button>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-xs text-text-secondary">
                By continuing, you agree to YuvaHub's{' '}
                <button onClick={() => { setIsModalOpen(false); setActiveTab('terms'); }} className="text-primary-blue hover:underline bg-transparent border-none cursor-pointer p-0 font-medium">Terms of Service</button>
                {' '}and{' '}
                <button onClick={() => { setIsModalOpen(false); setActiveTab('privacy'); }} className="text-primary-blue hover:underline bg-transparent border-none cursor-pointer p-0 font-medium">Privacy Policy</button>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

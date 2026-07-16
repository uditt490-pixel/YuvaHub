import React, { useState } from 'react';
import { Sparkles, Globe, BrainCircuit, Search, Zap, Code, Lightbulb, Trophy, Target, ArrowRight, Mail, X, Github } from 'lucide-react';
import { signInWithGoogle, signInWithGithub } from '../lib/firebase';
import { useAppContext } from '../context/AppContext';

export default function SplashAuth() {
  const { setActiveTab } = useAppContext();
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
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 h-[60px] bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-[17px] tracking-tight">YuvaHub</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-gray-700">
          <a href="#explore" onClick={(e) => { e.preventDefault(); document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-[#2563EB] transition-colors cursor-pointer">Learn</a>
          <a href="#competitions" onClick={(e) => { e.preventDefault(); document.getElementById('competitions')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-[#2563EB] transition-colors cursor-pointer">Compete</a>
          <a href="#stats" onClick={(e) => { e.preventDefault(); document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-[#2563EB] transition-colors cursor-pointer">Jobs</a>
          <a href="#footer" onClick={(e) => { e.preventDefault(); document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-[#2563EB] transition-colors cursor-pointer">Mentorship</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <button className="hidden sm:block px-4 py-2 text-[14px] font-medium border border-[#E2E8F0] rounded-[8px] hover:bg-gray-50 transition-colors">
            Host Event
          </button>
          <button onClick={handleLogin} disabled={loading !== null} className="px-5 py-2 text-[14px] font-medium bg-[#2563EB] text-white rounded-[8px] hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading !== null ? 'Wait...' : 'Login'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-block px-3 py-1 bg-[#FFF7ED] border border-orange-200 text-[#F97316] text-[11px] font-bold uppercase tracking-wide rounded-full mb-6">
            ⚡ Connecting Talent to Opportunity
          </div>
          <h1 className="text-[46px] font-[800] leading-[1.12] text-gray-900 mb-6">
            Unlock Your <span className="text-[#2563EB] italic">Career</span> Potential
          </h1>
          <p className="text-[16px] text-[#64748B] leading-[1.65] mb-8 max-w-lg">
            Join the premier network matching ambitious students with real-world competitions, hackathons, and tech roles globally.
          </p>
          
          <div className="relative max-w-md shadow-sm border border-[#E2E8F0] rounded-[10px] bg-white flex items-center p-1 mb-6">
            <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
            <input 
              type="text" 
              placeholder="Search companies, competitions, jobs..." 
              className="flex-1 bg-transparent border-none outline-none text-[13px] px-3 py-2 text-gray-900"
            />
            <button onClick={handleLogin} className="bg-[#F97316] text-white text-[13px] font-bold px-5 py-[13px] rounded-[6px] hover:bg-orange-600 transition-colors">
              Search
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12px] font-medium text-gray-500">Trending:</span>
            {['Generative AI', 'Web3', 'Product Management', 'Data Science'].map(t => (
              <span key={t} className="px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] text-gray-700 text-[12px] rounded-[100px]">
                {t}
              </span>
            ))}
          </div>
        </div>
        
        <div className="relative h-[400px] w-full rounded-[20px] bg-gradient-to-br from-[#EFF6FF] to-[#F0FDF4] shadow-lg border border-white flex items-center justify-center p-8">
           <div className="absolute top-[10%] left-[10%] w-[120px] bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 animate-float" style={{ animationDelay: '0s' }}>
              <span className="text-3xl">🚀</span>
              <span className="text-[10px] font-bold">Landed job at Google</span>
           </div>
           <div className="absolute bottom-[20%] right-[5%] w-[130px] bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 animate-float" style={{ animationDelay: '0.8s' }}>
              <span className="text-3xl">🏆</span>
              <span className="text-[10px] font-bold">Won ETHGlobal</span>
           </div>
           <div className="absolute top-[40%] right-[15%] w-[100px] bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 animate-float" style={{ animationDelay: '1.5s' }}>
              <span className="text-3xl">💡</span>
              <span className="text-[10px] font-bold">Top 10 Finalist</span>
           </div>
           <div className="w-64 h-64 bg-white/40 backdrop-blur-md rounded-full absolute border border-white/60"></div>
        </div>
      </section>

      {/* Explore Your Interest */}
      <section id="explore" className="bg-[#F8FAFC] py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[28px] font-[700] text-gray-900 mb-3">Explore Your Interest</h2>
            <p className="text-[15px] text-[#64748B]">Find standard competitions tailored to your skills and domain.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
             {[ 
               { title: 'Coding & Tech', sub: 'Hackathons, DSA', icon: Code, bg: '#DBEAFE', border: '#BFDBFE', text: '#1E3A8A' },
               { title: 'Business & Mgmt', sub: 'Case studies', icon: Lightbulb, bg: '#FEF3C7', border: '#FDE68A', text: '#92400E' },
               { title: 'Design & UX', sub: 'UI/UX Challenges', icon: Target, bg: '#D1FAE5', border: '#A7F3D0', text: '#065F46' },
               { title: 'Cultural & Arts', sub: 'Festivals, Media', icon: Sparkles, bg: '#EDE9FE', border: '#DDD6FE', text: '#5B21B6' }
             ].map((cat, i) => (
                <div key={i} className="bg-white rounded-[14px] p-7 flex flex-col items-center text-center shadow-sm border border-[#E2E8F0] transition-all duration-200 hover:-translate-y-[2px] hover:border-blue-300 hover:shadow-[0_0_0_3px_#DBEAFE] cursor-pointer">
                   <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center mb-4" style={{ backgroundColor: cat.bg, color: cat.text }}>
                      <cat.icon className="w-6 h-6" />
                   </div>
                   <h3 className="text-[15px] font-[600] text-gray-900 mb-1">{cat.title}</h3>
                   <p className="text-[12px] text-[#64748B]">{cat.sub}</p>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Featured Competitions */}
      <section id="competitions" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
         <div className="flex items-center justify-between mb-10">
            <h2 className="text-[28px] font-[700] text-gray-900">Featured Competitions</h2>
            <a href="#" onClick={handleLogin} className="text-[#2563EB] font-bold text-[14px] hover:underline flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></a>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
            {/* Card 1 */}
            <div className="bg-white border border-[#E2E8F0] rounded-[12px] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-[3px] transition-all duration-200 cursor-pointer">
               <div className="h-[150px] bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] flex items-center justify-center relative p-4">
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#16A34A] text-white text-[10px] font-bold uppercase rounded-full">LIVE</div>
                  <h3 className="text-white text-xl font-black tracking-widest text-center opacity-80 mt-2">HACKATHON 2024</h3>
               </div>
               <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-[22px] h-[22px] rounded-[5px] bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">ML</div>
                     <span className="text-[13px] text-[#64748B] font-medium">Major League Hacking</span>
                  </div>
                  <h4 className="text-[15px] font-[600] text-gray-900 mb-3 line-clamp-2">Global Innovation Challenge: AI & Web3</h4>
                  <div className="flex items-center text-[12px] text-[#64748B] justify-between">
                     <span>📅 Apr 15 - Apr 17</span>
                     <span>👥 1,204 Registered</span>
                  </div>
               </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-[#E2E8F0] rounded-[12px] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-[3px] transition-all duration-200 cursor-pointer">
               <div className="h-[150px] bg-[#F1F5F9] flex items-center justify-center relative p-4">
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#F97316] text-white text-[10px] font-bold uppercase rounded-full">PREMIUM</div>
                  <Trophy className="w-16 h-16 text-gray-300" />
               </div>
               <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-[22px] h-[22px] rounded-[5px] bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">ST</div>
                     <span className="text-[13px] text-[#64748B] font-medium">Stanford Univ</span>
                  </div>
                  <h4 className="text-[15px] font-[600] text-gray-900 mb-3 line-clamp-2">Stanford Business Case Competition 2025</h4>
                  <div className="flex items-center text-[12px] text-[#64748B] justify-between">
                     <span>📅 May 01 - May 05</span>
                     <span>👥 850 Registered</span>
                  </div>
               </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-[#E2E8F0] rounded-[12px] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-[3px] transition-all duration-200 cursor-pointer">
               <div className="h-[150px] bg-[#F1F5F9] flex items-center justify-center relative p-4">
                  <div className="absolute top-3 left-3 px-2 py-1 bg-[#16A34A] text-white text-[10px] font-bold uppercase rounded-full">FREE</div>
                  <Target className="w-16 h-16 text-gray-300" />
               </div>
               <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-[22px] h-[22px] rounded-[5px] bg-orange-100 text-orange-700 flex items-center justify-center text-[10px] font-bold">GO</div>
                     <span className="text-[13px] text-[#64748B] font-medium">Google Developer Groups</span>
                  </div>
                  <h4 className="text-[15px] font-[600] text-gray-900 mb-3 line-clamp-2">Solution Challenge India Regional</h4>
                  <div className="flex items-center text-[12px] text-[#64748B] justify-between">
                     <span>📅 Mar 10 - Jun 20</span>
                     <span>👥 5,200 Registered</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Stats Bar */}
      <section id="stats" className="bg-[#1D4ED8] py-[52px] px-6">
         <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-10 md:gap-[80px] text-center">
            <div>
               <div className="text-[40px] font-[800] text-white">5M+</div>
               <div className="text-[13px] uppercase tracking-[0.1em] text-white/80 mt-1 font-medium">Users</div>
            </div>
            <div className="hidden md:block w-px h-[40px] bg-white/20"></div>
            <div>
               <div className="text-[40px] font-[800] text-white">100k+</div>
               <div className="text-[13px] uppercase tracking-[0.1em] text-white/80 mt-1 font-medium">Events</div>
            </div>
            <div className="hidden md:block w-px h-[40px] bg-white/20"></div>
            <div>
               <div className="text-[40px] font-[800] text-white">2k+</div>
               <div className="text-[13px] uppercase tracking-[0.1em] text-white/80 mt-1 font-medium">Companies</div>
            </div>
            <div className="hidden md:block w-px h-[40px] bg-white/20"></div>
            <div>
               <div className="text-[40px] font-[800] text-white">500k+</div>
               <div className="text-[13px] uppercase tracking-[0.1em] text-white/80 mt-1 font-medium">Hired</div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-white pt-20 pb-8 px-6 lg:px-12 max-w-7xl mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_2fr] gap-10 mb-16">
            <div className="max-w-[220px]">
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-[#2563EB] flex items-center justify-center">
                     <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-bold text-[15px] tracking-tight text-gray-900">YuvaHub</span>
               </div>
               <p className="text-[13px] text-[#64748B] leading-relaxed">
                 Connecting the world's brightest minds to the most challenging opportunities globally.
               </p>
            </div>
            
            <div className="flex flex-col gap-[9px]">
               <h4 className="font-bold text-gray-900 mb-2">Competitions</h4>
               <a href="#" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Hackathons</a>
               <a href="#" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Quizzes</a>
               <a href="#" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Hiring Challenges</a>
               <a href="#" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Case Studies</a>
            </div>

            <div className="flex flex-col gap-[9px]">
               <h4 className="font-bold text-gray-900 mb-2">Opportunities</h4>
               <a href="#" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Internships</a>
               <a href="#" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Full Time Jobs</a>
               <a href="#" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Scholarships</a>
               <a href="#" className="text-[13px] text-[#64748B] hover:text-[#2563EB]">Fellowships</a>
            </div>

            <div>
               <h4 className="font-bold text-gray-900 mb-2">Stay Updated</h4>
               <p className="text-[13px] text-[#64748B] mb-4">Get the latest opportunities right in your inbox.</p>
               <div className="flex border border-[#E2E8F0] rounded-[8px] overflow-hidden focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB] transition-all">
                  <div className="bg-white flex items-center pl-3">
                     <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input type="email" placeholder="Email address" className="flex-1 text-[13px] px-3 py-2.5 outline-none bg-transparent text-gray-900" />
                  <button className="bg-[#2563EB] text-white px-4 py-2.5 text-[13px] font-bold hover:bg-blue-700 transition-colors">Join</button>
               </div>
            </div>
         </div>

         <div className="pt-6 border-t border-[#E2E8F0] flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-[13px] text-[#64748B]">&copy; 2026 YuvaHub Inc. All rights reserved.</span>
            <div className="flex gap-6">
               <button onClick={() => setActiveTab('legal')} className="text-[13px] text-[#64748B] hover:text-gray-900 bg-transparent border-none cursor-pointer p-0 font-medium">Privacy Policy</button>
               <button onClick={() => setActiveTab('legal')} className="text-[13px] text-[#64748B] hover:text-gray-900 bg-transparent border-none cursor-pointer p-0 font-medium">Terms of Service</button>
               <button onClick={() => setActiveTab('faq')} className="text-[13px] text-[#64748B] hover:text-gray-900 bg-transparent border-none cursor-pointer p-0 font-medium">Help & FAQ</button>
               <a href="mailto:support@yuvahub.com" className="text-[13px] text-[#64748B] hover:text-gray-900">Contact Us</a>
            </div>
         </div>
       </footer>

      {/* Login Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] w-full max-w-md shadow-2xl p-8 border border-gray-100 relative animate-fade-in">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to YuvaHub</h3>
              <p className="text-sm text-gray-500">Sign in to unlock personalized opportunities, AI mentoring, and discussion boards.</p>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={handleGoogleLogin} 
                disabled={loading !== null} 
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 border border-gray-200 hover:border-gray-300 rounded-[12px] bg-white text-gray-700 hover:bg-gray-50 font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-md"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span>{loading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
              </button>

              <button 
                onClick={handleGithubLogin} 
                disabled={loading !== null} 
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 border border-gray-200 hover:border-gray-300 rounded-[12px] bg-[#24292F] hover:bg-[#1C2024] text-white font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-md"
              >
                <Github className="w-5 h-5 text-white shrink-0" />
                <span>{loading === 'github' ? 'Connecting...' : 'Continue with GitHub'}</span>
              </button>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400">
                By continuing, you agree to YuvaHub's{' '}
                <button onClick={() => { setIsModalOpen(false); setActiveTab('legal'); }} className="text-blue-600 hover:underline bg-transparent border-none cursor-pointer p-0 font-medium">Terms of Service</button>
                {' '}and{' '}
                <button onClick={() => { setIsModalOpen(false); setActiveTab('legal'); }} className="text-blue-600 hover:underline bg-transparent border-none cursor-pointer p-0 font-medium">Privacy Policy</button>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

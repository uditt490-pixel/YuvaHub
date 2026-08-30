import React, { useState, useMemo, useCallback } from 'react';
import { FolderGit2, Star, GitFork, Eye, ExternalLink, Github, Code2, Globe, Smartphone, Database, Brain, Shield, Palette, Rocket, TrendingUp, Users, Clock, Search, Filter, Grid, List, Bookmark, Share2, Plus, Award, BarChart3, ArrowRight, Heart, MessageCircle, Zap, Target, Lock, Eye as EyeIcon } from 'lucide-react';

type ProjectCategory = 'web' | 'mobile' | 'ai/ml' | 'backend' | 'devops' | 'design' | 'security' | 'other';
type ProjectStatus = 'active' | 'archived' | 'maintenance';
type SortBy = 'stars' | 'updated' | 'forks' | 'name';

interface TechStack { name: string; color: string; }
interface Project {
  id: string; title: string; description: string; longDescription: string;
  category: ProjectCategory; status: ProjectStatus;
  stars: number; forks: number; views: number; likes: number;
  techStack: TechStack[]; imageUrl: string;
  githubUrl: string; liveUrl?: string;
  createdAt: string; updatedAt: string;
  isFeatured: boolean; isBookmarked: boolean;
  collaborators: number; commits: number;
  readme: string; license: string;
  weeklyStars: number[]; topContributor: string;
}

const TECH_COLORS: Record<string, string> = {
  React: '#61dafb', TypeScript: '#3178c6', 'Node.js': '#68a063', Python: '#3776ab',
  'Tailwind CSS': '#06b6d4', 'Next.js': '#000000', PostgreSQL: '#336791', MongoDB: '#47a248',
  Docker: '#2496ed', AWS: '#ff9900', GraphQL: '#e10098', Firebase: '#ffca28',
  Swift: '#f05138', Kotlin: '#7f52ff', 'React Native': '#61dafb', Flutter: '#02569b',
  TensorFlow: '#ff6f00', PyTorch: '#ee4c2c', OpenCV: '#5c3ee8', LangChain: '#412991',
  Redis: '#dc382d', Kubernetes: '#326ce5', Terraform: '#7b42bc', Nginx: '#009639',
  Vue: '#4fc08d', Svelte: '#ff3e00', Rust: '#dea584', Go: '#00add8',
  Figma: '#f24e1e', 'Framer Motion': '#bb4b95', Zustand: '#443e38', Supabase: '#3ecf8e',
};

const CATEGORIES: { id: ProjectCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'web', label: 'Web App', icon: <Globe className="w-4 h-4" />, color: 'text-blue-400 bg-blue-500/20' },
  { id: 'mobile', label: 'Mobile', icon: <Smartphone className="w-4 h-4" />, color: 'text-purple-400 bg-purple-500/20' },
  { id: 'ai/ml', label: 'AI/ML', icon: <Brain className="w-4 h-4" />, color: 'text-orange-400 bg-orange-500/20' },
  { id: 'backend', label: 'Backend', icon: <Database className="w-4 h-4" />, color: 'text-emerald-400 bg-emerald-500/20' },
  { id: 'devops', label: 'DevOps', icon: <Rocket className="w-4 h-4" />, color: 'text-cyan-400 bg-cyan-500/20' },
  { id: 'design', label: 'Design', icon: <Palette className="w-4 h-4" />, color: 'text-pink-400 bg-pink-500/20' },
  { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" />, color: 'text-red-400 bg-red-500/20' },
];

const PROJECTS: Project[] = [
  { id:'p1', title:'DevConnect Platform', description:'Full-stack developer networking platform with real-time messaging and project collaboration.', longDescription:'A comprehensive platform connecting developers worldwide. Features include real-time chat, project boards, skill matching, and collaborative coding sessions.', category:'web', status:'active', stars:342, forks:87, views:12400, likes:198, techStack:[{name:'React',color:'#61dafb'},{name:'TypeScript',color:'#3178c6'},{name:'Node.js',color:'#68a063'},{name:'PostgreSQL',color:'#336791'},{name:'Socket.io',color:'#010101'},{name:'Redis',color:'#dc382d'}], imageUrl:'devconnect', githubUrl:'https://github.com/user/devconnect', liveUrl:'https://devconnect.app', createdAt:'2026-03-15', updatedAt:'2026-08-20', isFeatured:true, isBookmarked:true, collaborators:12, commits:456, readme:'Full README with setup instructions, API docs, and contribution guidelines.', license:'MIT', weeklyStars:[12,18,15,22,28,35,42], topContributor:'Arjun M.' },
  { id:'p2', title:'AI Code Review Bot', description:'Automated code review using GPT-4 with GitHub Actions integration.', longDescription:'An intelligent bot that reviews pull requests, suggests improvements, detects bugs, and ensures code quality standards. Integrates with GitHub, GitLab, and Bitbucket.', category:'ai/ml', status:'active', stars:891, forks:234, views:34500, likes:567, techStack:[{name:'Python',color:'#3776ab'},{name:'LangChain',color:'#412991'},{name:'OpenAI',color:'#412991'},{name:'FastAPI',color:'#009688'},{name:'Docker',color:'#2496ed'}], imageUrl:'ai-code-review', githubUrl:'https://github.com/user/ai-code-review', createdAt:'2026-01-10', updatedAt:'2026-08-25', isFeatured:true, isBookmarked:false, collaborators:8, commits:892, readme:'Comprehensive docs with API reference and deployment guide.', license:'Apache-2.0', weeklyStars:[45,52,38,61,55,72,88], topContributor:'Priya S.' },
  { id:'p3', title:'EcoTracker Mobile', description:'Carbon footprint tracker with gamification and community challenges.', longDescription:'A mobile app helping users track and reduce their carbon footprint through daily challenges, community competitions, and reward systems.', category:'mobile', status:'active', stars:256, forks:45, views:8900, likes:134, techStack:[{name:'React Native',color:'#61dafb'},{name:'Firebase',color:'#ffca28'},{name:'Python',color:'#3776ab'},{name:'TensorFlow',color:'#ff6f00'}], imageUrl:'ecotracker', githubUrl:'https://github.com/user/ecotracker', liveUrl:'https://ecotracker.app', createdAt:'2026-05-01', updatedAt:'2026-08-18', isFeatured:false, isBookmarked:true, collaborators:5, commits:234, readme:'Mobile-first docs with screenshots and user guide.', license:'GPL-3.0', weeklyStars:[8,12,10,15,18,22,28], topContributor:'Vikram P.' },
  { id:'p4', title:'CloudDeploy CLI', description:'Zero-config deployment CLI for any cloud provider.', longDescription:'A powerful CLI tool that simplifies cloud deployments across AWS, GCP, and Azure. Supports Docker, Kubernetes, and serverless deployments.', category:'devops', status:'active', stars:1205, forks:312, views:45600, likes:789, techStack:[{name:'Go',color:'#00add8'},{name:'Docker',color:'#2496ed'},{name:'Kubernetes',color:'#326ce5'},{name:'Terraform',color:'#7b42bc'}], imageUrl:'clouddeploy', githubUrl:'https://github.com/user/clouddeploy', createdAt:'2025-11-20', updatedAt:'2026-08-26', isFeatured:true, isBookmarked:false, collaborators:23, commits:1567, readme:'Extensive docs with examples for each cloud provider.', license:'MIT', weeklyStars:[65,72,58,81,95,110,125], topContributor:'Ananya R.' },
  { id:'p5', title:'SecureVault', description:'End-to-end encrypted password manager with zero-knowledge architecture.', longDescription:'A privacy-first password manager using client-side encryption. No data ever leaves the device unencrypted.', category:'security', status:'active', stars:678, forks:156, views:23400, likes:423, techStack:[{name:'Rust',color:'#dea584'},{name:'React',color:'#61dafb'},{name:'WebAssembly',color:'#654ff0'},{name:'PostgreSQL',color:'#336791'}], imageUrl:'securevault', githubUrl:'https://github.com/user/securevault', createdAt:'2026-02-14', updatedAt:'2026-08-22', isFeatured:false, isBookmarked:false, collaborators:6, commits:345, readme:'Security-focused docs with audit reports.', license:'AGPL-3.0', weeklyStars:[22,28,18,35,42,38,45], topContributor:'Rohan G.' },
  { id:'p6', title:'PixelForge UI', description:'Open-source design system with 200+ accessible React components.', longDescription:'A comprehensive, accessible UI component library built with React, Tailwind CSS, and Radix UI primitives.', category:'design', status:'active', stars:2340, forks:567, views:67800, likes:1234, techStack:[{name:'React',color:'#61dafb'},{name:'TypeScript',color:'#3178c6'},{name:'Tailwind CSS',color:'#06b6d4'},{name:'Framer Motion',color:'#bb4b95'},{name:'Storybook',color:'#ff4785'}], imageUrl:'pixelforge', githubUrl:'https://github.com/user/pixelforge', liveUrl:'https://pixelforge.dev', createdAt:'2025-09-01', updatedAt:'2026-08-26', isFeatured:true, isBookmarked:true, collaborators:45, commits:2890, readme:'Complete design system docs with interactive playground.', license:'MIT', weeklyStars:[120,135,110,155,168,180,195], topContributor:'Sneha I.' },
  { id:'p7', title:'DataPipeline Pro', description:'Visual ETL pipeline builder with 50+ data source connectors.', longDescription:'A drag-and-drop data pipeline builder supporting databases, APIs, files, and streaming data sources.', category:'backend', status:'maintenance', stars:445, forks:98, views:18900, likes:267, techStack:[{name:'Python',color:'#3776ab'},{name:'Apache Airflow',color:'#017CEE'},{name:'Docker',color:'#2496ed'},{name:'Redis',color:'#dc382d'},{name:'PostgreSQL',color:'#336791'}], imageUrl:'datapipeline', githubUrl:'https://github.com/user/datapipeline', createdAt:'2025-12-01', updatedAt:'2026-07-15', isFeatured:false, isBookmarked:false, collaborators:9, commits:678, readme:'Architecture docs with pipeline examples.', license:'MIT', weeklyStars:[15,12,8,18,14,10,12], topContributor:'Karan S.' },
  { id:'p8', title:'NeuralStyle Transfer', description:'Real-time artistic style transfer using neural networks.', longDescription:'Apply artistic styles to images and videos in real-time using pre-trained neural networks with a beautiful web interface.', category:'ai/ml', status:'active', stars:567, forks:123, views:21000, likes:345, techStack:[{name:'Python',color:'#3776ab'},{name:'PyTorch',color:'#ee4c2c'},{name:'FastAPI',color:'#009688'},{name:'React',color:'#61dafb'},{name:'WebGL',color:'#990000'}], imageUrl:'neuralstyle', githubUrl:'https://github.com/user/neuralstyle', liveUrl:'https://neuralstyle.app', createdAt:'2026-04-10', updatedAt:'2026-08-24', isFeatured:false, isBookmarked:false, collaborators:4, commits:189, readme:'Jupyter notebook tutorials and API docs.', license:'MIT', weeklyStars:[18,22,15,28,32,25,38], topContributor:'Meera K.' },
];

const STATS = { totalProjects: PROJECTS.length, totalStars: PROJECTS.reduce((s,p)=>s+p.stars,0), totalForks: PROJECTS.reduce((s,p)=>s+p.forks,0), totalViews: PROJECTS.reduce((s,p)=>s+p.views,0), avgStars: Math.round(PROJECTS.reduce((s,p)=>s+p.stars,0)/PROJECTS.length), topProject: 'PixelForge UI', topTech: 'React' };

const getCatConfig = (c: ProjectCategory) => CATEGORIES.find(cat => cat.id === c) || CATEGORIES[0];

const statusColor = (s: ProjectStatus) => ({ active:'text-emerald-400 bg-emerald-500/20', archived:'text-gray-400 bg-gray-500/20', maintenance:'text-amber-400 bg-amber-500/20' }[s]);

export default function PortfolioShowcase() {
  const [tab, setTab] = useState<'gallery'|'analytics'|'bookmarks'>('gallery');
  const [cat, setCat] = useState<ProjectCategory|'all'>('all');
  const [sort, setSort] = useState<SortBy>('stars');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid'|'list'>('grid');
  const [sel, setSel] = useState<string|null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(PROJECTS.filter(p=>p.isBookmarked).map(p=>p.id)));

  const toggleBookmark = useCallback((id:string)=>{setBookmarks(p=>{const n=new Set(p);if(n.has(id))n.delete(id);else n.add(id);return n;});},[]);

  const filtered = useMemo(()=>{
    let p=[...PROJECTS];
    if(cat!=='all')p=p.filter(x=>x.category===cat);
    if(search){const q=search.toLowerCase();p=p.filter(x=>x.title.toLowerCase().includes(q)||x.description.toLowerCase().includes(q)||x.techStack.some(t=>t.name.toLowerCase().includes(q)));}
    if(sort==='stars')p.sort((a,b)=>b.stars-a.stars);
    else if(sort==='updated')p.sort((a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime());
    else if(sort==='forks')p.sort((a,b)=>b.forks-a.forks);
    else p.sort((a,b)=>a.title.localeCompare(b.title));
    return p;
  },[cat,sort,search]);

  const GalleryTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects, tech..." className="bg-surface/5 border border-border-theme rounded-xl pl-10 pr-4 py-2.5 text-text-primary text-sm w-64 focus:outline-none focus:border-cyan-500/50"/></div>
          <select value={cat} onChange={e=>setCat(e.target.value as ProjectCategory|'all')} className="bg-surface/5 border border-border-theme rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value as SortBy)} className="bg-surface/5 border border-border-theme rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none">
            <option value="stars">Most Stars</option>
            <option value="updated">Recently Updated</option>
            <option value="forks">Most Forks</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setView('grid')} className={`p-2 rounded-lg ${view==='grid'?'bg-surface/10 text-text-primary':'text-gray-400'}`}><Grid className="w-4 h-4"/></button>
          <button onClick={()=>setView('list')} className={`p-2 rounded-lg ${view==='list'?'bg-surface/10 text-text-primary':'text-gray-400'}`}><List className="w-4 h-4"/></button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {l:'Total Projects',v:STATS.totalProjects,i:<FolderGit2 className="w-5 h-5"/>,c:'text-blue-400'},
          {l:'Total Stars',v:STATS.totalStars.toLocaleString(),i:<Star className="w-5 h-5"/>,c:'text-amber-400'},
          {l:'Total Forks',v:STATS.totalForks.toLocaleString(),i:<GitFork className="w-5 h-5"/>,c:'text-purple-400'},
          {l:'Total Views',v:STATS.totalViews.toLocaleString(),i:<EyeIcon className="w-5 h-5"/>,c:'text-cyan-400'},
        ].map((s,i)=>(<div key={i} className="bg-surface/5 backdrop-blur-md border border-border-theme rounded-2xl p-4 hover:border-white/20 transition-all"><div className={`p-2 rounded-xl bg-surface/5 ${s.c} mb-2 inline-block`}>{s.i}</div><div className="text-xl font-bold text-text-primary">{s.v}</div><div className="text-gray-400 text-xs">{s.l}</div></div>))}
      </div>
      {view==='grid'?(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p=>{
            const catCfg=getCatConfig(p.category);
            return(
            <div key={p.id} onClick={()=>setSel(sel===p.id?null:p.id)} className={`bg-surface/5 backdrop-blur-md border rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-white/20 ${sel===p.id?'border-cyan-500/50 ring-1 ring-cyan-500/30':'border-border-theme'}`}>
              <div className="h-32 bg-gradient-to-br from-gray-700 to-gray-900 p-4 flex items-end relative">
                {p.isFeatured&&<div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/30 text-amber-300">⭐ Featured</div>}
                <div className="flex items-center gap-1 flex-wrap">{p.techStack.slice(0,4).map(t=><span key={t.name} className="px-1.5 py-0.5 rounded text-[8px] bg-black/40 text-text-primary/80">{t.name}</span>)}{p.techStack.length>4&&<span className="text-[8px] text-text-primary/60">+{p.techStack.length-4}</span>}</div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-medium ${catCfg.color}`}>{catCfg.label}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] ${statusColor(p.status)}`}>{p.status}</span>
                  </div>
                  <span className="text-[10px] text-gray-500">{p.updatedAt}</span>
                </div>
                <h3 className="text-text-primary font-semibold text-sm mb-1">{p.title}</h3>
                <p className="text-gray-400 text-xs line-clamp-2 mb-3">{p.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-3">
                  <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3"/>{p.stars}</span>
                  <span className="flex items-center gap-1"><GitFork className="w-3 h-3"/>{p.forks}</span>
                  <span className="flex items-center gap-1"><EyeIcon className="w-3 h-3"/>{p.views.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3"/>{p.collaborators}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <a href={p.githubUrl} onClick={e=>e.stopPropagation()} className="p-1.5 rounded-lg bg-surface/5 text-gray-400 hover:text-text-primary"><Github className="w-3.5 h-3.5"/></a>
                    {p.liveUrl&&<a href={p.liveUrl} onClick={e=>e.stopPropagation()} className="p-1.5 rounded-lg bg-surface/5 text-gray-400 hover:text-text-primary"><ExternalLink className="w-3.5 h-3.5"/></a>}
                    <button onClick={e=>{e.stopPropagation();toggleBookmark(p.id)}} className={`p-1.5 rounded-lg ${bookmarks.has(p.id)?'bg-amber-500/20 text-amber-400':'bg-surface/5 text-gray-400 hover:text-text-primary'}`}><Bookmark className="w-3.5 h-3.5" fill={bookmarks.has(p.id)?'currentColor':'none'}/></button>
                    <button onClick={e=>e.stopPropagation()} className="p-1.5 rounded-lg bg-surface/5 text-gray-400 hover:text-text-primary"><Share2 className="w-3.5 h-3.5"/></button>
                  </div>
                  <span className="text-[10px] text-gray-500">+{p.weeklyStars[p.weeklyStars.length-1]}⭐ this week</span>
                </div>
                {sel===p.id&&(
                  <div className="mt-3 pt-3 border-t border-border-theme space-y-2">
                    <p className="text-gray-300 text-xs">{p.longDescription}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-surface/5 rounded-lg p-2 text-center"><div className="text-text-primary text-xs font-medium">{p.commits}</div><div className="text-[9px] text-gray-500">Commits</div></div>
                      <div className="bg-surface/5 rounded-lg p-2 text-center"><div className="text-text-primary text-xs font-medium">{p.license}</div><div className="text-[9px] text-gray-500">License</div></div>
                      <div className="bg-surface/5 rounded-lg p-2 text-center"><div className="text-text-primary text-xs font-medium">{p.topContributor}</div><div className="text-[9px] text-gray-500">Top Dev</div></div>
                    </div>
                  </div>
                )}
              </div>
            </div>);})}
        </div>
      ):(
        <div className="space-y-2">
          {filtered.map(p=>{
            const catCfg=getCatConfig(p.category);
            return(
            <div key={p.id} onClick={()=>setSel(sel===p.id?null:p.id)} className="bg-surface/5 backdrop-blur-md border border-border-theme rounded-xl p-4 cursor-pointer hover:border-white/20 transition-all flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-amber-400 text-xs"><Star className="w-3 h-3"/>{p.stars}</span>
                <span className="flex items-center gap-1 text-gray-500 text-xs"><GitFork className="w-3 h-3"/>{p.forks}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><h3 className="text-text-primary font-medium text-sm">{p.title}</h3><span className={`px-2 py-0.5 rounded text-[9px] font-medium ${catCfg.color}`}>{catCfg.label}</span></div>
                <p className="text-gray-400 text-xs truncate">{p.description}</p>
              </div>
              <div className="flex items-center gap-1">{p.techStack.slice(0,3).map(t=><span key={t.name} className="px-1.5 py-0.5 rounded text-[8px] bg-surface/5 text-gray-400">{t.name}</span>)}</div>
              <span className="text-[10px] text-gray-500">{p.updatedAt}</span>
            </div>);})}
        </div>
      )}
    </div>
  );

  const AnalyticsTab = () => {
    const maxStars=Math.max(...PROJECTS.map(p=>p.stars));
    const allTech=PROJECTS.flatMap(p=>p.techStack.map(t=>t.name));
    const techCount:Record<string,number>={};allTech.forEach(t=>{techCount[t]=(techCount[t]||0)+1;});
    const topTechs=Object.entries(techCount).sort((a,b)=>b[1]-a[1]).slice(0,10);
    const catCounts:Record<string,number>={};PROJECTS.forEach(p=>{catCounts[p.category]=(catCounts[p.category]||0)+1;});
    return(
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {l:'Avg Stars',v:STATS.avgStars,i:<Star className="w-5 h-5"/>,c:'text-amber-400'},
          {l:'Total Commits',v:PROJECTS.reduce((s,p)=>s+p.commits,0).toLocaleString(),i:<Code2 className="w-5 h-5"/>,c:'text-emerald-400'},
          {l:'Contributors',v:PROJECTS.reduce((s,p)=>s+p.collaborators,0),i:<Users className="w-5 h-5"/>,c:'text-purple-400'},
          {l:'Top Project',v:'PixelForge',i:<Award className="w-5 h-5"/>,c:'text-cyan-400'},
        ].map((s,i)=>(<div key={i} className="bg-surface/5 backdrop-blur-md border border-border-theme rounded-2xl p-4"><div className={`p-2 rounded-xl bg-surface/5 ${s.c} mb-2 inline-block`}>{s.i}</div><div className="text-xl font-bold text-text-primary">{s.v}</div><div className="text-gray-400 text-xs">{s.l}</div></div>))}
      </div>
      <div className="bg-surface/5 backdrop-blur-md border border-border-theme rounded-2xl p-6">
        <h3 className="text-text-primary font-semibold mb-4">⭐ Stars by Project</h3>
        <div className="space-y-3">{PROJECTS.sort((a,b)=>b.stars-a.stars).map(p=>(<div key={p.id} className="flex items-center gap-4"><div className="w-36 text-xs text-gray-300 truncate">{p.title}</div><div className="flex-1 h-4 bg-surface/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{width:`${(p.stars/maxStars)*100}%`}}/></div><div className="w-12 text-right text-xs text-amber-400">{p.stars}</div></div>))}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface/5 backdrop-blur-md border border-border-theme rounded-2xl p-6">
          <h3 className="text-text-primary font-semibold mb-4">🔧 Top Technologies</h3>
          <div className="space-y-3">{topTechs.map(([tech,count],i)=>(<div key={tech}><div className="flex justify-between text-xs mb-1"><span className="text-gray-300">{tech}</span><span className="text-gray-400">{count} projects</span></div><div className="h-2 bg-surface/10 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 rounded-full" style={{width:`${(count/topTechs[0][1])*100}%`}}/></div></div>))}</div>
        </div>
        <div className="bg-surface/5 backdrop-blur-md border border-border-theme rounded-2xl p-6">
          <h3 className="text-text-primary font-semibold mb-4">📊 By Category</h3>
          <div className="space-y-3">{Object.entries(catCounts).sort((a,b)=>b[1]-a[1]).map(([cat,count])=>{const cfg=getCatConfig(cat as ProjectCategory);return(<div key={cat} className="flex items-center gap-3"><span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span><div className="flex-1 h-3 bg-surface/10 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{width:`${(count/PROJECTS.length)*100}%`}}/></div><span className="text-xs text-gray-400">{count}</span></div>);})}</div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-6">
        <h3 className="text-text-primary font-semibold mb-3">💡 Portfolio Insights</h3>
        <div className="space-y-2">
          <div className="text-sm text-gray-300 bg-surface/5 rounded-xl p-3">🏆 PixelForge UI leads with {PROJECTS[5].stars} stars — open-source design systems get massive community love</div>
          <div className="text-sm text-gray-300 bg-surface/5 rounded-xl p-3">🔧 React appears in {techCount['React']||0} projects — the most popular tech in your portfolio</div>
          <div className="text-sm text-gray-300 bg-surface/5 rounded-xl p-3">📈 DevOps projects average {Math.round(PROJECTS.filter(p=>p.category==='devops').reduce((s,p)=>s+p.stars,0)/Math.max(PROJECTS.filter(p=>p.category==='devops').length,1))} stars — highest engagement category</div>
        </div>
      </div>
    </div>);
  };

  const BookmarksTab = () => {
    const bmk=PROJECTS.filter(p=>bookmarks.has(p.id));
    return(
    <div className="space-y-6">
      {bmk.length===0?<div className="text-center py-16"><Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-4"/><div className="text-text-primary font-semibold">No bookmarks yet</div><div className="text-gray-400 text-sm mt-1">Click the bookmark icon on any project to save it here</div></div>:(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bmk.map(p=>{const catCfg=getCatConfig(p.category);return(
          <div key={p.id} className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-0.5 rounded text-[9px] font-medium ${catCfg.color}`}>{catCfg.label}</span>
              <button onClick={()=>toggleBookmark(p.id)} className="p-1 rounded bg-amber-500/20 text-amber-400"><Bookmark className="w-3 h-3" fill="currentColor"/></button>
            </div>
            <h3 className="text-text-primary font-semibold text-sm mb-1">{p.title}</h3>
            <p className="text-gray-400 text-xs mb-3">{p.description}</p>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3"/>{p.stars}</span>
              <span className="flex items-center gap-1"><GitFork className="w-3 h-3"/>{p.forks}</span>
              <span className="flex items-center gap-1"><EyeIcon className="w-3 h-3"/>{p.views.toLocaleString()}</span>
            </div>
          </div>);})}
        </div>
      )}
    </div>);
  };

  return(
    <div className="min-h-screen font-sans pb-16">
      {/* Top Banner Header - Brand Theme */}
      <div className="m-4 sm:m-6 bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" /> Developer Portfolio
              </span>
              <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30">
                GitHub Integrated
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Project <span className="text-primary-blue italic">Portfolio</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Showcase your best repositories, track performance analytics, and manage saved bookmarks from the community.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full shadow-xs">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-4 border-primary-blue bg-background font-serif font-bold text-base text-primary-blue">
              {STATS.totalProjects}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Projects</div>
              <div className="text-xs font-extrabold text-white">{STATS.totalStars.toLocaleString()} Stars Earned</div>
              <div className="text-[11px] text-emerald-400 font-semibold">{STATS.totalForks.toLocaleString()} Forks · {STATS.totalViews.toLocaleString()} Views</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/10 pb-3">
          {[{id:'gallery' as const,l:'Gallery',i:<Grid className="w-4 h-4"/>,c:PROJECTS.length},{id:'analytics' as const,l:'Analytics',i:<BarChart3 className="w-4 h-4"/>},{id:'bookmarks' as const,l:'Bookmarks',i:<Bookmark className="w-4 h-4"/>,c:bookmarks.size}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${tab===t.id?"bg-primary-blue text-white shadow-lg":"text-gray-400 hover:text-white hover:bg-surface/5"}`}>{t.i}{t.l}{t.c!==undefined&&<span className="text-xs opacity-60">({t.c})</span>}</button>
          ))}
        </div>
      </div>
      <div className="w-full px-6 py-8">
        {tab==='gallery'&&<GalleryTab/>}{tab==='analytics'&&<AnalyticsTab/>}{tab==='bookmarks'&&<BookmarksTab/>}
      </div>
    </div>
  );
}

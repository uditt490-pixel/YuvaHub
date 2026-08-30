import React, { useState, useMemo, useCallback } from 'react';
import { TrendingUp, DollarSign, Target, Rocket, Brain, Shield, Globe, Database, Palette, Compass, Map, Swords, Eye, Lightbulb, ChevronRight, ArrowRight } from 'lucide-react';

type DemandLevel = 'low' | 'medium' | 'high' | 'very-high';
type TimeFrame = '1yr' | '3yr' | '5yr' | '10yr';

interface JobRole { id: string; title: string; description: string; icon: React.ReactNode; color: string; bgColor: string; avgSalary: number; salaryRange: [number, number]; demand: DemandLevel; growthRate: number; requiredSkills: { skillId: string; level: number }[]; workLifeBalance: number; remoteFriendly: boolean; entryBarrier: string; dayInTheLife: string[]; pros: string[]; cons: string[]; }
interface Skill { id: string; name: string; currentLevel: number; icon: string; }

const SKILLS: Skill[] = [
  { id: 's1', name: 'React', currentLevel: 78, icon: '⚛️' }, { id: 's2', name: 'TypeScript', currentLevel: 62, icon: '🔷' },
  { id: 's3', name: 'Node.js', currentLevel: 55, icon: '🟢' }, { id: 's4', name: 'Python', currentLevel: 85, icon: '🐍' },
  { id: 's5', name: 'Machine Learning', currentLevel: 32, icon: '🧠' }, { id: 's6', name: 'PostgreSQL', currentLevel: 48, icon: '🐘' },
  { id: 's7', name: 'Tailwind CSS', currentLevel: 92, icon: '🎨' }, { id: 's8', name: 'Git', currentLevel: 95, icon: '📦' },
  { id: 's9', name: 'Docker', currentLevel: 22, icon: '🐳' }, { id: 's10', name: 'AWS', currentLevel: 18, icon: '☁️' },
  { id: 's11', name: 'GraphQL', currentLevel: 45, icon: '◼️' }, { id: 's12', name: 'System Design', currentLevel: 28, icon: '🏗️' },
  { id: 's13', name: 'Data Structures', currentLevel: 80, icon: '🌲' }, { id: 's14', name: 'Algorithms', currentLevel: 75, icon: '⚡' },
  { id: 's15', name: 'Next.js', currentLevel: 58, icon: '▲' }, { id: 's16', name: 'React Native', currentLevel: 30, icon: '📱' },
  { id: 's17', name: 'Kubernetes', currentLevel: 15, icon: '⎈' }, { id: 's18', name: 'Figma', currentLevel: 40, icon: '🎯' },
];

const ROLES: JobRole[] = [
  { id:'j1', title:'Frontend Engineer', description:'Build beautiful, responsive UIs.', icon:<Globe className="w-5 h-5"/>, color:'text-blue-400', bgColor:'bg-blue-500/20', avgSalary:1200000, salaryRange:[800000,1800000], demand:'high', growthRate:14, requiredSkills:[{skillId:'s1',level:70},{skillId:'s2',level:50},{skillId:'s7',level:60},{skillId:'s15',level:40}], workLifeBalance:8, remoteFriendly:true, entryBarrier:'medium', dayInTheLife:['Review PRs','Build UI components','Fix bugs','Collaborate with designers','Optimize performance'], pros:['High demand','Visual impact','Remote-friendly','Strong ecosystem'], cons:['Constantly evolving','Browser issues','Performance optimization'] },
  { id:'j2', title:'Backend Engineer', description:'Design scalable server-side systems.', icon:<Database className="w-5 h-5"/>, color:'text-emerald-400', bgColor:'bg-emerald-500/20', avgSalary:1350000, salaryRange:[900000,2000000], demand:'very-high', growthRate:17, requiredSkills:[{skillId:'s3',level:65},{skillId:'s6',level:55},{skillId:'s4',level:50},{skillId:'s12',level:40}], workLifeBalance:7, remoteFriendly:true, entryBarrier:'medium', dayInTheLife:['Design APIs','Optimize queries','Review architecture','Deploy services','Monitor production'], pros:['Highest demand','Great salaries','Core to product'], cons:['Production debugging','On-call rotations','Complex systems'] },
  { id:'j3', title:'Full-Stack Developer', description:'End-to-end development.', icon:<Rocket className="w-5 h-5"/>, color:'text-purple-400', bgColor:'bg-purple-500/20', avgSalary:1400000, salaryRange:[950000,2100000], demand:'very-high', growthRate:20, requiredSkills:[{skillId:'s1',level:60},{skillId:'s3',level:60},{skillId:'s2',level:50},{skillId:'s6',level:45}], workLifeBalance:7, remoteFriendly:true, entryBarrier:'medium', dayInTheLife:['Standup','Build features end-to-end','Write API and UI','Deploy and test','Code review'], pros:['Versatile','Own full product','High demand'], cons:['Context switching','Broad knowledge needed'] },
  { id:'j4', title:'ML Engineer', description:'Build and deploy ML models.', icon:<Brain className="w-5 h-5"/>, color:'text-orange-400', bgColor:'bg-orange-500/20', avgSalary:1800000, salaryRange:[1200000,3000000], demand:'very-high', growthRate:35, requiredSkills:[{skillId:'s4',level:80},{skillId:'s5',level:70},{skillId:'s10',level:40}], workLifeBalance:6, remoteFriendly:true, entryBarrier:'hard', dayInTheLife:['Experiment with architectures','Clean datasets','Train and evaluate models','Deploy to production','Research papers'], pros:['Highest salaries','Cutting-edge work','Massive growth'], cons:['Long training times','Data quality issues','Hard to break in'] },
  { id:'j5', title:'DevOps Engineer', description:'Automate infrastructure and CI/CD.', icon:<Shield className="w-5 h-5"/>, color:'text-cyan-400', bgColor:'bg-cyan-500/20', avgSalary:1500000, salaryRange:[1000000,2400000], demand:'high', growthRate:22, requiredSkills:[{skillId:'s9',level:70},{skillId:'s10',level:60},{skillId:'s17',level:50},{skillId:'s3',level:40}], workLifeBalance:5, remoteFriendly:true, entryBarrier:'hard', dayInTheLife:['Monitor system health','Optimize CI/CD','Manage K8s clusters','Automate deployments','Respond to incidents'], pros:['Critical role','Great salaries','Remote-friendly'], cons:['On-call pressure','Incident stress','Complex infrastructure'] },
  { id:'j6', title:'UI/UX Designer', description:'Design intuitive user experiences.', icon:<Palette className="w-5 h-5"/>, color:'text-pink-400', bgColor:'bg-pink-500/20', avgSalary:1100000, salaryRange:[700000,1700000], demand:'medium', growthRate:10, requiredSkills:[{skillId:'s18',level:75},{skillId:'s7',level:40},{skillId:'s1',level:30}], workLifeBalance:8, remoteFriendly:true, entryBarrier:'easy', dayInTheLife:['User research','Create wireframes','Design mockups','Collaborate with devs','Usability testing'], pros:['Creative work','User impact','Good balance'], cons:['Subjective feedback','Difficult stakeholders'] },
  { id:'j7', title:'Data Engineer', description:'Build data pipelines at scale.', icon:<Database className="w-5 h-5"/>, color:'text-amber-400', bgColor:'bg-amber-500/20', avgSalary:1450000, salaryRange:[950000,2200000], demand:'high', growthRate:25, requiredSkills:[{skillId:'s4',level:70},{skillId:'s6',level:65},{skillId:'s10',level:45},{skillId:'s9',level:35}], workLifeBalance:7, remoteFriendly:true, entryBarrier:'medium', dayInTheLife:['Design ETL pipelines','Optimize data warehouse','Build real-time streaming','Ensure data quality','Collaborate with analysts'], pros:['High demand','Great salaries','Foundation for AI'], cons:['Data quality issues','Legacy integration'] },
  { id:'j8', title:'Security Engineer', description:'Protect systems from threats.', icon:<Shield className="w-5 h-5"/>, color:'text-red-400', bgColor:'bg-red-500/20', avgSalary:1600000, salaryRange:[1100000,2600000], demand:'very-high', growthRate:30, requiredSkills:[{skillId:'s9',level:50},{skillId:'s10',level:50},{skillId:'s3',level:45},{skillId:'s12',level:40}], workLifeBalance:5, remoteFriendly:true, entryBarrier:'hard', dayInTheLife:['Security audits','Penetration testing','Review code for vulns','Respond to incidents','Implement policies'], pros:['Critical role','High salaries','Never boring'], cons:['High stress','On-call','Constant learning'] },
];

const PATHS = [
  { id:'cp1', title:'Frontend → Full-Stack → Tech Lead', steps:['Junior Frontend','Senior Frontend','Full-Stack','Tech Lead','Eng Manager'], time:'6-8 years' },
  { id:'cp2', title:'Backend → Architect → CTO', steps:['Junior Backend','Senior Backend','Architect','VP Eng','CTO'], time:'8-12 years' },
  { id:'cp3', title:'ML → Research → AI Lead', steps:['ML Intern','ML Engineer','Sr ML Eng','Researcher','AI Lead'], time:'7-10 years' },
  { id:'cp4', title:'DevOps → Platform → SRE Lead', steps:['Junior DevOps','DevOps Eng','Platform Eng','SRE Lead','Infra Director'], time:'6-9 years' },
];

const SAL_PROJ = [
  { role:'Frontend', data:[{y:'1yr',l:8,m:12,h:18},{y:'3yr',l:12,m:18,h:28},{y:'5yr',l:18,m:28,h:40},{y:'10yr',l:30,m:45,h:65}] },
  { role:'Backend', data:[{y:'1yr',l:9,m:13,h:20},{y:'3yr',l:14,m:22,h:32},{y:'5yr',l:20,m:32,h:48},{y:'10yr',l:35,m:52,h:75}] },
  { role:'ML Engineer', data:[{y:'1yr',l:12,m:18,h:30},{y:'3yr',l:18,m:30,h:50},{y:'5yr',l:28,m:45,h:70},{y:'10yr',l:45,m:70,h:100}] },
];

const DMND: Record<DemandLevel, {l:string;c:string}> = { low:{l:'Low',c:'text-gray-400 bg-gray-500/20'}, medium:{l:'Medium',c:'text-amber-400 bg-amber-500/20'}, high:{l:'High',c:'text-emerald-400 bg-emerald-500/20'}, 'very-high':{l:'Very High',c:'text-red-400 bg-red-500/20'} };

const getMatch = (role: JobRole) => { let t=0; role.requiredSkills.forEach(rs=>{const s=SKILLS.find(sk=>sk.id===rs.skillId);if(s)t+=Math.min(100,(s.currentLevel/rs.level)*100);}); return Math.round(t/role.requiredSkills.length); };
const getGaps = (role: JobRole) => role.requiredSkills.map(rs=>{const s=SKILLS.find(sk=>sk.id===rs.skillId);const c=s?.currentLevel||0;return{skill:s?.name||rs.skillId,icon:s?.icon||'📦',current:c,required:rs.level,gap:Math.max(0,rs.level-c)};}).filter(g=>g.gap>0).sort((a,b)=>b.gap-a.gap);

export default function CareerPathSimulator() {
  const [tab, setTab] = useState<'explore'|'compare'|'salary'|'paths'|'gap'>('explore');
  const [sel, setSel] = useState<string|null>(null);
  const [cmp, setCmp] = useState<string[]>(['j1','j4']);
  const [dmnd, setDmnd] = useState<DemandLevel|'all'>('all');
  const [tf, setTf] = useState<TimeFrame>('5yr');

  const toggle = useCallback((id:string)=>{setCmp(p=>p.includes(id)?p.filter(r=>r!==id):p.length>=4?p:[...p,id]);},[]);
  const roles = useMemo(()=>{let r=[...ROLES];if(dmnd!=='all')r=r.filter(x=>x.demand===dmnd);return r.sort((a,b)=>b.avgSalary-a.avgSalary);},[dmnd]);

  const ExploreTab = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <select value={dmnd} onChange={e=>setDmnd(e.target.value as DemandLevel|'all')} className="bg-surface/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
          <option value="all">All Demand</option>
          {Object.entries(DMND).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}
        </select>
        <span className="text-gray-400 text-sm">{roles.length} roles</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map(role=>{
          const m=getMatch(role);const gaps=getGaps(role);
          return(
          <div key={role.id} onClick={()=>setSel(sel===role.id?null:role.id)} className={`bg-surface/5 backdrop-blur-md border rounded-2xl p-5 cursor-pointer transition-all ${sel===role.id?'border-cyan-500/50 ring-1 ring-cyan-500/30':'border-white/10 hover:border-white/20'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${role.bgColor} ${role.color}`}>{role.icon}</div>
                <div><div className="text-white font-semibold">{role.title}</div><div className="text-gray-500 text-[10px]">{role.description}</div></div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${DMND[role.demand].c}`}>{DMND[role.demand].l}</span>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1"><span className="text-gray-400">Your Match</span><span className={`font-bold ${m>=80?'text-emerald-400':m>=50?'text-amber-400':'text-red-400'}`}>{m}%</span></div>
              <div className="h-2 bg-surface/10 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${m}%`,backgroundColor:m>=80?'#10b981':m>=50?'#f59e0b':'#ef4444'}}/></div>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="bg-surface/5 rounded-lg p-2 text-center"><div className="text-emerald-400 text-xs font-medium">₹{(role.avgSalary/100000).toFixed(1)}L</div><div className="text-[9px] text-gray-500">Avg</div></div>
              <div className="bg-surface/5 rounded-lg p-2 text-center"><div className="text-cyan-400 text-xs font-medium">+{role.growthRate}%</div><div className="text-[9px] text-gray-500">Growth</div></div>
              <div className="bg-surface/5 rounded-lg p-2 text-center"><div className="text-purple-400 text-xs font-medium">{role.workLifeBalance}/10</div><div className="text-[9px] text-gray-500">Balance</div></div>
              <div className="bg-surface/5 rounded-lg p-2 text-center"><div className="text-amber-400 text-xs font-medium">{role.remoteFriendly?'🌍':'🏢'}</div><div className="text-[9px] text-gray-500">{role.remoteFriendly?'Remote':'Office'}</div></div>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {role.requiredSkills.map(rs=>{const s=SKILLS.find(sk=>sk.id===rs.skillId);const ok=(s?.currentLevel||0)>=rs.level;return<span key={rs.skillId} className={`px-2 py-0.5 rounded text-[9px] ${ok?'bg-emerald-500/20 text-emerald-400':'bg-amber-500/20 text-amber-400'}`}>{s?.icon} {s?.name} {ok?'✓':`${s?.currentLevel||0}/${rs.level}`}</span>;})}
            </div>
            {sel===role.id&&(<div className="mt-3 pt-3 border-t border-white/10 space-y-3">
              <div className="text-xs text-gray-400 mb-1">Day in the Life</div>
              {role.dayInTheLife.map((it,j)=><div key={j} className="text-[11px] text-gray-300 flex items-center gap-2"><ChevronRight className="w-3 h-3 text-cyan-400"/>{it}</div>)}
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-[10px] text-emerald-400 font-medium mb-1">✅ Pros</div>{role.pros.map((p,j)=><div key={j} className="text-[10px] text-gray-400">• {p}</div>)}</div>
                <div><div className="text-[10px] text-red-400 font-medium mb-1">⚠️ Cons</div>{role.cons.map((c,j)=><div key={j} className="text-[10px] text-gray-400">• {c}</div>)}</div>
              </div>
            </div>)}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <button onClick={e=>{e.stopPropagation();toggle(role.id)}} className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${cmp.includes(role.id)?'bg-cyan-500/20 border-cyan-500/40 text-cyan-400':'bg-surface/5 border-white/10 text-gray-400'}`}>{cmp.includes(role.id)?'✓ Comparing':'Compare'}</button>
              <span className="text-[10px] text-gray-500">₹{(role.salaryRange[0]/100000).toFixed(0)}L - ₹{(role.salaryRange[1]/100000).toFixed(0)}L</span>
            </div>
          </div>);})}
      </div>
    </div>
  );

  const CompareTab = () => {
    const rs=cmp.map(id=>ROLES.find(r=>r.id===id)).filter(Boolean) as JobRole[];
    if(rs.length<2)return<div className="text-center py-16"><Swords className="w-12 h-12 text-gray-600 mx-auto mb-4"/><div className="text-white font-semibold">Select 2-4 roles to compare</div></div>;
    return(
    <div className="space-y-6">
      <div className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
        <div className="grid gap-px bg-surface/5" style={{gridTemplateColumns:`200px repeat(${rs.length},1fr)`}}>
          <div className="bg-surface/5 p-4 text-xs text-gray-400 font-medium">Metric</div>
          {rs.map(r=><div key={r.id} className={`p-4 text-center ${r.bgColor}`}><div className={`text-sm font-semibold ${r.color}`}>{r.title}</div></div>)}
          {[{l:'Avg Salary',v:rs.map(r=>`₹${(r.avgSalary/100000).toFixed(1)}L`)},{l:'Demand',v:rs.map(r=>DMND[r.demand].l)},{l:'Growth',v:rs.map(r=>`+${r.growthRate}%`)},{l:'Work-Life',v:rs.map(r=>`${r.workLifeBalance}/10`)},{l:'Remote',v:rs.map(r=>r.remoteFriendly?'Yes ✓':'No ✗')},{l:'Entry Barrier',v:rs.map(r=>r.entryBarrier)},{l:'Your Match',v:rs.map(r=>`${getMatch(r)}%`)},{l:'Skill Gaps',v:rs.map(r=>`${getGaps(r).length} gaps`)}].map((row,i)=>(
            <React.Fragment key={i}><div className={`bg-surface/5 p-3 text-xs text-gray-400 ${i%2===0?'':'bg-surface/[0.02]'}`}>{row.l}</div>{row.v.map((v,j)=><div key={j} className={`p-3 text-center text-xs text-white ${i%2===0?'bg-surface/[0.02]':'bg-surface/5'}`}>{v}</div>)}</React.Fragment>
          ))}
        </div>
      </div>
      <div className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Skill Match Comparison</h3>
        <div className="space-y-4">{rs.map(r=>{const m=getMatch(r);return(<div key={r.id}><div className="flex items-center justify-between mb-1"><span className={`text-sm font-medium ${r.color}`}>{r.title}</span><span className="text-xs text-gray-400">{m}%</span></div><div className="h-3 bg-surface/10 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${m}%`,backgroundColor:m>=80?'#10b981':m>=50?'#f59e0b':'#ef4444'}}/></div></div>);})}</div>
      </div>
    </div>);
  };

  const SalaryTab = () => {
    const yi=tf==='1yr'?0:tf==='3yr'?1:tf==='5yr'?2:3;
    return(
    <div className="space-y-6">
      <div className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Salary Projections</h3>
        <div className="flex gap-2 mb-4">{(['1yr','3yr','5yr','10yr'] as TimeFrame[]).map(t=><button key={t} onClick={()=>setTf(t)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${tf===t?'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400':'bg-surface/5 border border-white/10 text-gray-400'}`}>{t==='1yr'?'1 Year':t==='3yr'?'3 Years':t==='5yr'?'5 Years':'10 Years'}</button>)}</div>
        <div className="space-y-6">{SAL_PROJ.map(p=>{const d=p.data[yi];return(<div key={p.role}><div className="text-sm text-gray-300 mb-2">{p.role}</div><div className="flex gap-1 items-end h-10"><div className="flex-1 bg-red-500/30 rounded-l-lg flex items-center px-2" style={{height:`${(d.l/100)*100}%`}}><span className="text-[10px] text-red-300">₹{d.l}L</span></div><div className="flex-1 bg-amber-500/40 flex items-center px-2" style={{height:`${(d.m/100)*100}%`}}><span className="text-[10px] text-amber-300">₹{d.m}L</span></div><div className="flex-1 bg-emerald-500/40 rounded-r-lg flex items-center px-2" style={{height:`${(d.h/100)*100}%`}}><span className="text-[10px] text-emerald-300">₹{d.h}L</span></div></div></div>);})}</div>
        <div className="flex items-center gap-4 mt-4 text-[10px] text-gray-400"><div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500/30"/>Low</div><div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-500/40"/>Mid</div><div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500/40"/>High</div></div>
      </div>
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3">💡 Salary Insights</h3>
        <div className="space-y-2">
          <div className="text-sm text-gray-300 bg-surface/5 rounded-xl p-3">🤖 ML Engineer: highest growth (+35%) and top salaries at ₹30L+</div>
          <div className="text-sm text-gray-300 bg-surface/5 rounded-xl p-3">📈 Full-Stack: broadest demand (+20%) — most versatile path</div>
          <div className="text-sm text-gray-300 bg-surface/5 rounded-xl p-3">🔒 Security: 20% salary premium due to talent shortage</div>
        </div>
      </div>
    </div>);
  };

  const PathsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{PATHS.map(p=>(<div key={p.id} className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
        <div className="flex items-center justify-between mb-3"><h3 className="text-white font-semibold text-sm">{p.title}</h3><span className="text-[10px] text-gray-500">{p.time}</span></div>
        <div className="flex items-center gap-1 flex-wrap">{p.steps.map((s,i)=><React.Fragment key={i}><span className="px-2 py-1 rounded-lg text-[10px] bg-surface/5 text-gray-300 border border-white/10">{s}</span>{i<p.steps.length-1&&<ArrowRight className="w-3 h-3 text-gray-500"/>}</React.Fragment>)}</div>
      </div>))}</div>
      <div className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Salary Growth Timeline</h3>
        <div className="relative"><div className="absolute left-4 top-0 bottom-0 w-px bg-surface/10"/>{[{y:'Year 0-1',s:'₹8-12L',r:'Junior/Entry',c:'text-gray-400'},{y:'Year 2-3',s:'₹12-20L',r:'Mid-Level',c:'text-blue-400'},{y:'Year 4-6',s:'₹20-35L',r:'Senior Engineer',c:'text-purple-400'},{y:'Year 7-9',s:'₹35-55L',r:'Staff/Principal',c:'text-amber-400'},{y:'Year 10+',s:'₹55-100L+',r:'Director/VP/CTO',c:'text-emerald-400'}].map((l,i)=>(<div key={i} className="flex items-start gap-4 py-4 relative"><div className="w-8 h-8 rounded-full bg-surface/10 border-2 border-white/20 flex items-center justify-center text-xs font-bold text-white z-10">{i+1}</div><div className="flex-1"><div className="flex items-center justify-between"><div className={`font-semibold text-sm ${l.c}`}>{l.r}</div><div className="text-white font-bold text-sm">{l.s}</div></div><div className="text-gray-500 text-[10px]">{l.y}</div></div></div>))}</div>
      </div>
    </div>
  );

  const GapTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-2 flex items-center gap-2"><Target className="w-5 h-5 text-amber-400"/>Skill Gap Analysis</h3>
        <p className="text-gray-400 text-sm">See what skills you need for each target role.</p>
      </div>
      {ROLES.map(role=>{const gaps=getGaps(role);const m=getMatch(role);if(!gaps.length)return null;return(
        <div key={role.id} className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className={`p-2 rounded-xl ${role.bgColor} ${role.color}`}>{role.icon}</div><div><div className="text-white font-semibold">{role.title}</div><div className="text-gray-500 text-[10px]">{m}% match · {gaps.length} gaps</div></div></div>
          <div className={`px-3 py-1 rounded-lg text-xs font-bold ${m>=80?'bg-emerald-500/20 text-emerald-400':m>=50?'bg-amber-500/20 text-amber-400':'bg-red-500/20 text-red-400'}`}>{m}% Ready</div></div>
          <div className="space-y-3">{gaps.map(g=>(<div key={g.skill}><div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-300">{g.icon} {g.skill}</span><span className="text-[10px] text-amber-400">Gap: {g.gap}% ({g.current}%→{g.required}%)</span></div><div className="h-2 bg-surface/10 rounded-full overflow-hidden relative"><div className="h-full bg-cyan-500 rounded-full" style={{width:`${g.current}%`}}/><div className="absolute inset-y-0 border-r-2 border-dashed border-amber-400" style={{left:`${g.required}%`}}/></div></div>))}</div>
          <div className="mt-3 p-3 bg-amber-500/5 rounded-xl flex items-start gap-2"><Lightbulb className="w-4 h-4 text-amber-400 mt-0.5"/><div className="text-[11px] text-gray-300">Est. <span className="text-amber-400 font-medium">{Math.round(gaps.reduce((s,g)=>s+g.gap*0.5,0))}h</span> to close. Focus on <span className="text-white font-medium">{gaps[0]?.skill}</span> first.</div></div>
        </div>);})}
    </div>
  );

  return(
    <div className="min-h-screen ">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-purple-600/20 to-amber-600/20"/>
        <div className="relative px-6 py-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Compass className="w-8 h-8 text-cyan-400"/>Career Path Simulator</h1>
          <p className="text-gray-400 mt-2">{ROLES.length} roles · Compare salaries · Find gaps · Plan your path</p>
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
            {[{id:'explore' as const,l:'Explore',i:<Eye className="w-4 h-4"/>},{id:'compare' as const,l:'Compare',i:<Swords className="w-4 h-4"/>,c:cmp.length},{id:'salary' as const,l:'Salary',i:<DollarSign className="w-4 h-4"/>},{id:'paths' as const,l:'Paths',i:<Map className="w-4 h-4"/>},{id:'gap' as const,l:'Gap Analysis',i:<Target className="w-4 h-4"/>}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${tab===t.id?"bg-surface/10 text-white border border-white/20 shadow-lg":"text-gray-400 hover:text-white hover:bg-surface/5"}`}>{t.i}{t.l}{t.c!==undefined&&<span className="text-xs opacity-60">({t.c})</span>}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {tab==="explore"&&<ExploreTab/>}{tab==="compare"&&<CompareTab/>}{tab==="salary"&&<SalaryTab/>}{tab==="paths"&&<PathsTab/>}{tab==="gap"&&<GapTab/>}
      </div>
    </div>
  );
}

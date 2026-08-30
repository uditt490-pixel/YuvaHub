import React, { useState, useMemo, useCallback } from 'react';
import { Users, Star, Clock, Calendar, MessageCircle, Video, Award, TrendingUp, Search, Filter, ChevronRight, CheckCircle, Target, Zap, Heart, Brain, Code, Globe, Shield, Palette, Rocket, BarChart3, ArrowRight, Bookmark, Share2, Bell, Phone, Mail } from 'lucide-react';

type MentorSpecialty = 'frontend' | 'backend' | 'ai/ml' | 'devops' | 'design' | 'security' | 'mobile' | 'career';
type SessionStatus = 'scheduled' | 'completed' | 'cancelled';
type MatchScore = 'excellent' | 'good' | 'fair';

interface Mentor {
  id: string; name: string; avatar: string; title: string; company: string;
  specialties: MentorSpecialty[]; experience: number; rating: number;
  reviews: number; hourlyRate: number; availability: string[];
  bio: string; skills: string[]; mentees: number; sessions: number;
  responseTime: string; languages: string[]; isAvailable: boolean;
  topReview: string; achievements: string[];
}

interface MentorSession {
  id: string; mentorId: string; mentorName: string; menteeName: string;
  topic: string; date: string; time: string; duration: number;
  status: SessionStatus; type: 'video' | 'chat' | 'call';
  notes?: string; rating?: number; feedback?: string;
}

interface MentorMatch {
  mentorId: string; score: MatchScore; matchPercent: number;
  reasons: string[]; sharedSkills: string[];
}

const SPECIALTIES: { id: MentorSpecialty; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'frontend', label: 'Frontend', icon: <Globe className="w-4 h-4"/>, color: 'text-blue-400 bg-blue-500/20' },
  { id: 'backend', label: 'Backend', icon: <Code className="w-4 h-4"/>, color: 'text-emerald-400 bg-emerald-500/20' },
  { id: 'ai/ml', label: 'AI/ML', icon: <Brain className="w-4 h-4"/>, color: 'text-orange-400 bg-orange-500/20' },
  { id: 'devops', label: 'DevOps', icon: <Rocket className="w-4 h-4"/>, color: 'text-cyan-400 bg-cyan-500/20' },
  { id: 'design', label: 'Design', icon: <Palette className="w-4 h-4"/>, color: 'text-pink-400 bg-pink-500/20' },
  { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4"/>, color: 'text-red-400 bg-red-500/20' },
  { id: 'mobile', label: 'Mobile', icon: <Zap className="w-4 h-4"/>, color: 'text-purple-400 bg-purple-500/20' },
  { id: 'career', label: 'Career', icon: <Target className="w-4 h-4"/>, color: 'text-amber-400 bg-amber-500/20' },
];

const MENTORS: Mentor[] = [
  { id:'m1', name:'Dr. Arjun Mehta', avatar:'AM', title:'Principal Engineer', company:'Google', specialties:['ai/ml','backend'], experience:12, rating:4.9, reviews:156, hourlyRate:5000, availability:['Mon','Wed','Fri'], bio:'Former ML lead at Google Brain. Passionate about teaching ML concepts and system design.', skills:['Python','TensorFlow','System Design','Go','Kubernetes'], mentees:45, sessions:890, responseTime:'< 2 hours', languages:['English','Hindi'], isAvailable:true, topReview:'Best mentor I ever had. Arjun explained complex ML concepts so simply!', achievements:['Google Top Contributor','100+ mentored students','Published 15 papers'] },
  { id:'m2', name:'Priya Sharma', avatar:'PS', title:'Staff Frontend Engineer', company:'Meta', specialties:['frontend','design'], experience:8, rating:4.8, reviews:234, hourlyRate:4000, availability:['Tue','Thu','Sat'], bio:'React core team contributor. Expert in performance optimization and design systems.', skills:['React','TypeScript','GraphQL','Figma','CSS'], mentees:67, sessions:1230, responseTime:'< 1 hour', languages:['English','Hindi','Marathi'], isAvailable:true, topReview:'Priya helped me land my dream job at a top product company!', achievements:['React Conf Speaker','Open Source Maintainer','Design System Expert'] },
  { id:'m3', name:'Vikram Patel', avatar:'VP', title:'DevOps Architect', company:'Amazon', specialties:['devops','backend'], experience:10, rating:4.7, reviews:98, hourlyRate:4500, availability:['Mon','Tue','Thu'], bio:'AWS Solutions Architect Pro certified. Built infrastructure serving 100M+ users.', skills:['AWS','Kubernetes','Terraform','Docker','Python'], mentees:34, sessions:567, responseTime:'< 3 hours', languages:['English','Gujarati'], isAvailable:true, topReview:'Vikram demystified cloud architecture for me. Highly recommend!', achievements:['AWS Hero','Built 3 unicorn infrastructures','Cloud Conference Speaker'] },
  { id:'m4', name:'Ananya Roy', avatar:'AR', title:'Security Engineer Lead', company:'Microsoft', specialties:['security','backend'], experience:9, rating:4.9, reviews:87, hourlyRate:5500, availability:['Wed','Fri','Sat'], bio:'Cybersecurity expert with experience in zero-trust architecture and penetration testing.', skills:['Security','Python','Cryptography','Network Security','Compliance'], mentees:28, sessions:445, responseTime:'< 4 hours', languages:['English','Bengali'], isAvailable:true, topReview:'Ananya changed my perspective on security. Essential for any developer!', achievements:['Bug Bounty Hall of Fame','OWASP Contributor','Security Conference Speaker'] },
  { id:'m5', name:'Rohan Gupta', avatar:'RG', title:'Mobile Engineering Lead', company:'Flipkart', specialties:['mobile','frontend'], experience:7, rating:4.6, reviews:145, hourlyRate:3500, availability:['Mon','Wed','Sat'], bio:'Built Flipkart\'s mobile app used by 300M+ users. Expert in React Native and Flutter.', skills:['React Native','Flutter','Swift','Kotlin','Firebase'], mentees:52, sessions:780, responseTime:'< 2 hours', languages:['English','Hindi','Tamil'], isAvailable:true, topReview:'Rohan\'s practical approach to mobile development is incredible!', achievements:['Flipkart App of the Year','Flutter Community Leader','50+ Mobile Apps Shipped'] },
  { id:'m6', name:'Sneha Iyer', avatar:'SI', title:'Product Design Director', company:'Stripe', specialties:['design','career'], experience:11, rating:4.8, reviews:198, hourlyRate:6000, availability:['Tue','Thu'], bio:'Design leader at Stripe. Expert in fintech UX, design systems, and user research.', skills:['Figma','User Research','Design Systems','Prototyping','Accessibility'], mentees:38, sessions:670, responseTime:'< 2 hours', languages:['English','Tamil','Telugu'], isAvailable:true, topReview:'Sneha helped me transition from engineering to design. Life-changing!', achievements:['Stripe Design Award','Awwwards Judge','Design Systems Pioneer'] },
  { id:'m7', name:'Karan Singh', avatar:'KS', title:'AI Research Scientist', company:'DeepMind', specialties:['ai/ml','career'], experience:6, rating:4.9, reviews:67, hourlyRate:7000, availability:['Fri','Sat'], bio:'DeepMind researcher working on large language models. Published in NeurIPS and ICML.', skills:['PyTorch','NLP','Reinforcement Learning','Python','Research'], mentees:15, sessions:234, responseTime:'< 6 hours', languages:['English','Hindi','Punjabi'], isAvailable:false, topReview:'Karan is a genius who makes complex AI concepts accessible!', achievements:['NeurIPS Best Paper','DeepMind Research Lead','PhD Stanford'] },
  { id:'m8', name:'Meera Kumar', avatar:'MK', title:'Senior Backend Engineer', company:'Netflix', specialties:['backend','devops'], experience:8, rating:4.7, reviews:112, hourlyRate:4200, availability:['Mon','Wed','Thu'], bio:'Netflix scale backend engineer. Expert in microservices, caching, and real-time systems.', skills:['Java','Microservices','Redis','Kafka','PostgreSQL'], mentees:42, sessions:567, responseTime:'< 2 hours', languages:['English','Hindi','Kannada'], isAvailable:true, topReview:'Meera\'s real-world Netflix experience is invaluable!', achievements:['Netflix Tech Blog Author','Microservices Expert','Open Source Contributor'] },
];

const SESSIONS: MentorSession[] = [
  { id:'s1', mentorId:'m1', mentorName:'Dr. Arjun Mehta', menteeName:'You', topic:'ML Model Optimization Strategies', date:'2026-08-28', time:'14:00', duration:60, status:'scheduled', type:'video' },
  { id:'s2', mentorId:'m2', mentorName:'Priya Sharma', menteeName:'You', topic:'React Performance Deep Dive', date:'2026-08-25', time:'10:00', duration:45, status:'completed', type:'video', notes:'Discussed lazy loading, virtual lists, and memo patterns.', rating:5, feedback:'Excellent session! Learned practical optimization techniques.' },
  { id:'s3', mentorId:'m3', mentorName:'Vikram Patel', menteeName:'You', topic:'AWS Cost Optimization', date:'2026-08-20', time:'16:00', duration:30, status:'completed', type:'call', notes:'Covered reserved instances, spot pricing, and auto-scaling.', rating:4, feedback:'Very practical advice on reducing cloud costs.' },
  { id:'s4', mentorId:'m5', mentorName:'Rohan Gupta', menteeName:'You', topic:'React Native vs Flutter Decision', date:'2026-08-15', time:'11:00', duration:45, status:'completed', type:'video', rating:5, feedback:'Helped me make the right technology choice for my project.' },
  { id:'s5', mentorId:'m2', mentorName:'Priya Sharma', menteeName:'You', topic:'Design System Architecture', date:'2026-08-30', time:'09:00', duration:60, status:'scheduled', type:'video' },
  { id:'s6', mentorId:'m6', mentorName:'Sneha Iyer', menteeName:'You', topic:'Career Transition to Design', date:'2026-09-02', time:'15:00', duration:45, status:'scheduled', type:'chat' },
];

const MATCHES: MentorMatch[] = [
  { mentorId:'m2', score:'excellent', matchPercent:95, reasons:['Expert in your target stack (React/TypeScript)','Similar career trajectory guidance','Highly responsive (< 1hr)','Excellent reviews from mentees'], sharedSkills:['React','TypeScript','GraphQL'] },
  { mentorId:'m1', score:'excellent', matchPercent:92, reasons:['Deep AI/ML expertise you want to learn','Patient teaching style','Strong system design knowledge','Published researcher'], sharedSkills:['Python','System Design'] },
  { mentorId:'m3', score:'good', matchPercent:85, reasons:['Strong DevOps knowledge','AWS certification paths','Real-world infrastructure experience','Good availability'], sharedSkills:['Docker','AWS'] },
  { mentorId:'m5', score:'good', matchPercent:82, reasons:['Mobile development expertise','React Native specialist','Practical project-based approach','Fast response time'], sharedSkills:['React','Firebase'] },
];

const STATUS_COLOR: Record<SessionStatus, string> = {
  scheduled: 'text-cyan-400 bg-cyan-500/20', completed: 'text-emerald-400 bg-emerald-500/20', cancelled: 'text-red-400 bg-red-500/20'
};

const MATCH_COLOR: Record<MatchScore, string> = {
  excellent: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40', good: 'text-blue-400 bg-blue-500/20 border-blue-500/40', fair: 'text-amber-400 bg-amber-500/20 border-amber-500/40'
};

const getSpecConfig = (s: MentorSpecialty) => SPECIALTIES.find(sp => sp.id === s) || SPECIALTIES[0];

export default function MentorshipNetwork() {
  const [tab, setTab] = useState<'discover'|'sessions'|'matches'|'analytics'>('discover');
  const [spec, setSpec] = useState<MentorSpecialty|'all'>('all');
  const [search, setSearch] = useState('');
  const [sel, setSel] = useState<string|null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(['m2','m6']));

  const toggleBookmark = useCallback((id:string)=>{setBookmarks(p=>{const n=new Set(p);if(n.has(id))n.delete(id);else n.add(id);return n;});},[]);

  const filtered = useMemo(()=>{
    let m=[...MENTORS];
    if(spec!=='all')m=m.filter(x=>x.specialties.includes(spec));
    if(search){const q=search.toLowerCase();m=m.filter(x=>x.name.toLowerCase().includes(q)||x.company.toLowerCase().includes(q)||x.skills.some(s=>s.toLowerCase().includes(q)));}
    return m.sort((a,b)=>b.rating-a.rating);
  },[spec,search]);

  const upcoming = SESSIONS.filter(s=>s.status==='scheduled');
  const completed = SESSIONS.filter(s=>s.status==='completed');

  const DiscoverTab = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search mentors, skills, companies..." className="bg-surface/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm w-64 focus:outline-none focus:border-cyan-500/50"/></div>
        <div className="flex gap-1 flex-wrap">
          <button onClick={()=>setSpec('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${spec==='all'?'bg-surface/10 text-white border border-white/20':'bg-surface/5 text-gray-400 border border-white/10'}`}>All</button>
          {SPECIALTIES.map(s=>(<button key={s.id} onClick={()=>setSpec(s.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${spec===s.id?`${s.color} border border-current/40`:'bg-surface/5 text-gray-400 border border-white/10'}`}>{s.label}</button>))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {l:'Available Mentors',v:MENTORS.filter(m=>m.isAvailable).length,i:<Users className="w-5 h-5"/>,c:'text-cyan-400'},
          {l:'Avg Rating',v:'4.8',i:<Star className="w-5 h-5"/>,c:'text-amber-400'},
          {l:'Total Sessions',v:MENTORS.reduce((s,m)=>s+m.sessions,0).toLocaleString(),i:<Calendar className="w-5 h-5"/>,c:'text-emerald-400'},
          {l:'Your Matches',v:MATCHES.length,i:<Target className="w-5 h-5"/>,c:'text-purple-400'},
        ].map((s,i)=>(<div key={i} className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-4"><div className={`p-2 rounded-xl bg-surface/5 ${s.c} mb-2 inline-block`}>{s.i}</div><div className="text-xl font-bold text-white">{s.v}</div><div className="text-gray-400 text-xs">{s.l}</div></div>))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(m=>{
          return(
          <div key={m.id} onClick={()=>setSel(sel===m.id?null:m.id)} className={`bg-surface/5 backdrop-blur-md border rounded-2xl p-5 cursor-pointer transition-all ${sel===m.id?'border-cyan-500/50 ring-1 ring-cyan-500/30':'border-white/10 hover:border-white/20'}`}>
            <div className="flex items-start gap-4 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{m.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold">{m.name}</h3>
                  {m.isAvailable&&<span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400">Available</span>}
                </div>
                <div className="text-gray-400 text-xs">{m.title} · {m.company}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-amber-400 text-xs"><Star className="w-3 h-3" fill="currentColor"/>{m.rating}</div>
                  <span className="text-gray-500 text-[10px]">({m.reviews} reviews)</span>
                  <span className="text-gray-500 text-[10px]">· {m.experience}y exp</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-sm">₹{m.hourlyRate}</div>
                <div className="text-[9px] text-gray-500">/session</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {m.specialties.map(s=>{const c=getSpecConfig(s);return<span key={s} className={`px-2 py-0.5 rounded text-[9px] font-medium ${c.color}`}>{c.icon} {c.label}</span>;})}
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {m.skills.slice(0,5).map(s=><span key={s} className="px-2 py-0.5 rounded text-[9px] bg-surface/5 text-gray-400">{s}</span>)}
              {m.skills.length>5&&<span className="text-[9px] text-gray-500">+{m.skills.length-5}</span>}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-surface/5 rounded-lg p-2 text-center"><div className="text-white text-xs font-medium">{m.mentees}</div><div className="text-[9px] text-gray-500">Mentees</div></div>
              <div className="bg-surface/5 rounded-lg p-2 text-center"><div className="text-white text-xs font-medium">{m.sessions}</div><div className="text-[9px] text-gray-500">Sessions</div></div>
              <div className="bg-surface/5 rounded-lg p-2 text-center"><div className="text-white text-xs font-medium">{m.responseTime}</div><div className="text-[9px] text-gray-500">Response</div></div>
            </div>
            {sel===m.id&&(
              <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                <p className="text-gray-300 text-xs">{m.bio}</p>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                  <div className="text-[10px] text-amber-400 font-medium mb-1">💬 Top Review</div>
                  <div className="text-xs text-gray-300 italic">"{m.topReview}"</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 mb-1">Availability</div>
                  <div className="flex gap-1">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><span key={d} className={`px-2 py-0.5 rounded text-[9px] ${m.availability.includes(d)?'bg-emerald-500/20 text-emerald-400':'bg-surface/5 text-gray-600'}`}>{d}</span>)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 mb-1">Achievements</div>
                  <div className="flex flex-wrap gap-1">{m.achievements.map((a,i)=><span key={i} className="px-2 py-0.5 rounded text-[9px] bg-purple-500/20 text-purple-400">🏆 {a}</span>)}</div>
                </div>
                <div className="text-[10px] text-gray-400">🌐 {m.languages.join(' · ')} · 📱 {m.responseTime}</div>
              </div>
            )}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <button onClick={e=>{e.stopPropagation();toggleBookmark(m.id)}} className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${bookmarks.has(m.id)?'bg-amber-500/20 border-amber-500/40 text-amber-400':'bg-surface/5 border-white/10 text-gray-400'}`}>{bookmarks.has(m.id)?'★ Saved':'Save'}</button>
              <button className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-[10px] text-white font-medium transition-all">Book Session →</button>
            </div>
          </div>);})}
      </div>
    </div>
  );

  const SessionsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {l:'Upcoming',v:upcoming.length,i:<Calendar className="w-5 h-5"/>,c:'text-cyan-400'},
          {l:'Completed',v:completed.length,i:<CheckCircle className="w-5 h-5"/>,c:'text-emerald-400'},
          {l:'Total Hours',v:completed.reduce((s,x)=>s+x.duration,0)/60+'h',i:<Clock className="w-5 h-5"/>,c:'text-purple-400'},
          {l:'Avg Rating',v:completed.filter(s=>s.rating).reduce((s,x)=>s+(x.rating||0),0)/completed.filter(s=>s.rating).length+'/5',i:<Star className="w-5 h-5"/>,c:'text-amber-400'},
        ].map((s,i)=>(<div key={i} className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-4"><div className={`p-2 rounded-xl bg-surface/5 ${s.c} mb-2 inline-block`}>{s.i}</div><div className="text-xl font-bold text-white">{s.v}</div><div className="text-gray-400 text-xs">{s.l}</div></div>))}
      </div>
      {upcoming.length>0&&(
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Calendar className="w-5 h-5 text-cyan-400"/> Upcoming Sessions</h3>
          <div className="space-y-3">{upcoming.map(s=>(
            <div key={s.id} className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">{s.type==='video'?<Video className="w-5 h-5 text-cyan-400"/>:s.type==='call'?<Phone className="w-5 h-5 text-cyan-400"/>:<MessageCircle className="w-5 h-5 text-cyan-400"/>}</div>
              <div className="flex-1">
                <div className="text-white font-medium text-sm">{s.topic}</div>
                <div className="text-gray-400 text-[10px]">with {s.mentorName} · {s.date} · {s.time} · {s.duration}min</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-[10px] text-white font-medium">Join</button>
                <button className="px-3 py-1.5 bg-surface/5 border border-white/10 rounded-lg text-gray-400 text-[10px]">Reschedule</button>
              </div>
            </div>))}</div>
        </div>
      )}
      {completed.length>0&&(
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-400"/> Completed Sessions</h3>
          <div className="space-y-3">{completed.map(s=>(
            <div key={s.id} className="bg-surface/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div><div className="text-white font-medium text-sm">{s.topic}</div><div className="text-gray-400 text-[10px]">with {s.mentorName} · {s.date} · {s.duration}min</div></div>
                {s.rating&&<div className="flex items-center gap-1 text-amber-400 text-sm">{Array.from({length:s.rating}).map((_,i)=><Star key={i} className="w-3 h-3" fill="currentColor"/>)}</div>}
              </div>
              {s.notes&&<div className="text-gray-400 text-xs mb-2 bg-surface/5 rounded-lg p-2">{s.notes}</div>}
              {s.feedback&&<div className="text-cyan-400 text-xs italic">"{s.feedback}"</div>}
            </div>))}</div>
        </div>
      )}
    </div>
  );

  const MatchesTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-2 flex items-center gap-2"><Target className="w-5 h-5 text-purple-400"/>AI-Powered Mentor Matching</h3>
        <p className="text-gray-400 text-sm">Based on your skills, goals, learning style, and availability preferences.</p>
      </div>
      {MATCHES.map((match,i)=>{
        const mentor=MENTORS.find(m=>m.id===match.mentorId);if(!mentor)return null;
        return(
        <div key={match.mentorId} className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">{mentor.avatar}</div>
              <div><div className="text-white font-semibold">{mentor.name}</div><div className="text-gray-400 text-xs">{mentor.title} · {mentor.company}</div></div>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${MATCH_COLOR[match.score]}`}>{match.matchPercent}% Match</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="text-[10px] text-gray-400 mb-2">Why this match?</div>
              {match.reasons.map((r,j)=><div key={j} className="text-[11px] text-gray-300 flex items-center gap-2 mb-1"><CheckCircle className="w-3 h-3 text-emerald-400"/>{r}</div>)}
            </div>
            <div>
              <div className="text-[10px] text-gray-400 mb-2">Shared Skills</div>
              <div className="flex flex-wrap gap-1">{match.sharedSkills.map(s=><span key={s} className="px-2 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-400">{s}</span>)}</div>
              <div className="mt-3">
                <div className="text-[10px] text-gray-400 mb-1">Availability</div>
                <div className="flex gap-1">{mentor.availability.map(d=><span key={d} className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/20 text-emerald-400">{d}</span>)}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 bg-surface/5 border border-white/10 rounded-lg text-gray-400 text-xs hover:text-white transition-all">View Profile</button>
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white text-xs font-medium transition-all">Book Session →</button>
          </div>
        </div>);})}
    </div>
  );

  const AnalyticsTab = () => {
    const totalSessions=completed.length;
    const avgRating=completed.filter(s=>s.rating).reduce((s,x)=>s+(x.rating||0),0)/completed.filter(s=>s.rating).length;
    const totalHours=completed.reduce((s,x)=>s+x.duration,0)/60;
    return(
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {l:'Sessions Completed',v:totalSessions,i:<Calendar className="w-5 h-5"/>,c:'text-emerald-400'},
          {l:'Hours Learned',v:totalHours+'h',i:<Clock className="w-5 h-5"/>,c:'text-cyan-400'},
          {l:'Avg Session Rating',v:avgRating.toFixed(1)+'/5',i:<Star className="w-5 h-5"/>,c:'text-amber-400'},
          {l:'Mentors Connected',v:new Set(SESSIONS.map(s=>s.mentorId)).size,i:<Users className="w-5 h-5"/>,c:'text-purple-400'},
        ].map((s,i)=>(<div key={i} className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-4"><div className={`p-2 rounded-xl bg-surface/5 ${s.c} mb-2 inline-block`}>{s.i}</div><div className="text-xl font-bold text-white">{s.v}</div><div className="text-gray-400 text-xs">{s.l}</div></div>))}
      </div>
      <div className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">📊 Sessions by Mentor</h3>
        <div className="space-y-3">{MENTORS.filter(m=>SESSIONS.some(s=>s.mentorId===m.id)).map(m=>{
          const count=SESSIONS.filter(s=>s.mentorId===m.id).length;
          return(<div key={m.id} className="flex items-center gap-4"><div className="w-28 text-xs text-gray-300 truncate">{m.name}</div><div className="flex-1 h-4 bg-surface/10 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 rounded-full" style={{width:`${(count/3)*100}%`}}/></div><div className="w-8 text-right text-xs text-gray-400">{count}</div></div>);
        })}</div>
      </div>
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3">💡 Mentorship Insights</h3>
        <div className="space-y-2">
          <div className="text-sm text-gray-300 bg-surface/5 rounded-xl p-3">🎯 Your best match is Priya Sharma (95%) — book a session to maximize learning</div>
          <div className="text-sm text-gray-300 bg-surface/5 rounded-xl p-3">📈 Video sessions have 20% higher satisfaction than chat — prefer video calls</div>
          <div className="text-sm text-gray-300 bg-surface/5 rounded-xl p-3">⏰ Your peak learning time is morning (9-11 AM) — schedule important sessions then</div>
        </div>
      </div>
    </div>);
  };

  return(
    <div className="min-h-screen  font-sans pb-16">
      {/* Top Banner Header - Brand Theme */}
      <div className="m-4 sm:m-6 bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                <Users className="w-3.5 h-3.5 text-indigo-400" /> Mentorship Hub
              </span>
              <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30">
                1:1 Career Guidance
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Mentorship <span className="text-primary-blue italic">Network</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Connect with experienced mentors, book 1:1 sessions, get personalized career guidance, and track your mentorship journey.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full shadow-xs">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-4 border-primary-blue bg-background font-serif font-bold text-base text-primary-blue">
              {MENTORS.length}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Mentors</div>
              <div className="text-xs font-extrabold text-white">{SESSIONS.length} Sessions Completed</div>
              <div className="text-[11px] text-emerald-400 font-semibold">{MATCHES.length} AI Matches Available</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/10 pb-3">
          {[{id:'discover' as const,l:'Discover',i:<Search className="w-4 h-4"/>,c:filtered.length},{id:'sessions' as const,l:'Sessions',i:<Calendar className="w-4 h-4"/>,c:SESSIONS.length},{id:'matches' as const,l:'AI Matches',i:<Target className="w-4 h-4"/>,c:MATCHES.length},{id:'analytics' as const,l:'Analytics',i:<BarChart3 className="w-4 h-4"/>}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${tab===t.id?"bg-primary-blue text-white shadow-lg":"text-gray-400 hover:text-white hover:bg-surface/5"}`}>{t.i}{t.l}{t.c!==undefined&&<span className="text-xs opacity-60">({t.c})</span>}</button>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {tab==='discover'&&<DiscoverTab/>}{tab==='sessions'&&<SessionsTab/>}{tab==='matches'&&<MatchesTab/>}{tab==='analytics'&&<AnalyticsTab/>}
      </div>
    </div>
  );
}

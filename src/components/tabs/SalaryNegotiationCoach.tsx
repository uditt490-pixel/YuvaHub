import React, { useState, useMemo } from 'react';
import {
  DollarSign, TrendingUp, BarChart3, Target, Users, BookOpen, MessageSquare,
  CheckCircle, AlertTriangle, ArrowRight, ChevronDown, ChevronRight, Search,
  Map, Briefcase, Star, Award, Zap, Shield, Copy, RefreshCw, Calculator,
  Clock, Brain, Lightbulb, Handshake
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────
interface SalaryData {
  role: string;
  company: string;
  location: string;
  base: number;
  bonus: number;
  equity: number;
  total: number;
  level: string;
  yearsExp: number;
  negotiationResult: string;
}

interface NegotiationScript {
  id: string;
  phase: 'initial' | 'counter' | 'close' | 'renegotiate';
  scenario: string;
  opener: string;
  body: string;
  closer: string;
  tips: string[];
  risk: 'low' | 'medium' | 'high';
  expectedUplift: string;
}

interface MarketBench {
  role: string;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  growth: number;
  demand: 'hot' | 'warm' | 'cold';
}

interface CounterOffer {
  scenario: string;
  companyOffer: string;
  yourAsk: string;
  strategy: string;
  timeline: string;
  template: string;
  successRate: string;
}

interface NegotiationTactic {
  name: string;
  category: 'leverage' | 'anchor' | 'silence' | 'trade' | 'framing';
  effectiveness: number;
  description: string;
  example: string;
  doThis: string;
  avoidThis: string;
}

// ─── Data ───────────────────────────────────────────────────
const SALARY_DATA: SalaryData[] = [
  { role: 'Frontend Developer', company: 'Google', location: 'Bangalore', base: 2800000, bonus: 400000, equity: 1200000, total: 4400000, level: 'L4', yearsExp: 4, negotiationResult: '+22%' },
  { role: 'Backend Developer', company: 'Microsoft', location: 'Hyderabad', base: 2600000, bonus: 350000, equity: 800000, total: 3750000, level: '62', yearsExp: 5, negotiationResult: '+18%' },
  { role: 'Full Stack Developer', company: 'Amazon', location: 'Chennai', base: 2400000, bonus: 300000, equity: 600000, total: 3300000, level: 'SDE-II', yearsExp: 3, negotiationResult: '+15%' },
  { role: 'ML Engineer', company: 'Flipkart', location: 'Bangalore', base: 3200000, bonus: 500000, equity: 1500000, total: 5200000, level: 'Senior', yearsExp: 6, negotiationResult: '+25%' },
  { role: 'DevOps Engineer', company: 'Razorpay', location: 'Bangalore', base: 2200000, bonus: 280000, equity: 500000, total: 2980000, level: 'Senior', yearsExp: 4, negotiationResult: '+20%' },
  { role: 'Product Manager', company: 'Swiggy', location: 'Bangalore', base: 3000000, bonus: 450000, equity: 800000, total: 4250000, level: 'Senior', yearsExp: 7, negotiationResult: '+16%' },
  { role: 'Data Scientist', company: 'PhonePe', location: 'Pune', base: 2500000, bonus: 320000, equity: 700000, total: 3520000, level: 'Senior', yearsExp: 4, negotiationResult: '+19%' },
  { role: 'iOS Developer', company: 'Zomato', location: 'Gurugram', base: 2100000, bonus: 250000, equity: 400000, total: 2750000, level: 'Senior', yearsExp: 5, negotiationResult: '+14%' },
  { role: 'Solutions Architect', company: 'AWS', location: 'Bangalore', base: 3500000, bonus: 500000, equity: 1800000, total: 5800000, level: 'L6', yearsExp: 8, negotiationResult: '+28%' },
  { role: 'Security Engineer', company: 'Palantir', location: 'Remote', base: 3800000, bonus: 600000, equity: 2000000, total: 6400000, level: 'Senior', yearsExp: 7, negotiationResult: '+30%' },
];

const MARKET_BENCHS: MarketBench[] = [
  { role: 'Frontend Developer', p25: 800000, p50: 1400000, p75: 2200000, p90: 3200000, growth: 15, demand: 'hot' },
  { role: 'Backend Developer', p25: 900000, p50: 1600000, p75: 2500000, p90: 3600000, growth: 14, demand: 'hot' },
  { role: 'ML/AI Engineer', p25: 1200000, p50: 2000000, p75: 3200000, p90: 5000000, growth: 28, demand: 'hot' },
  { role: 'DevOps Engineer', p25: 900000, p50: 1500000, p75: 2400000, p90: 3400000, growth: 20, demand: 'hot' },
  { role: 'Data Scientist', p25: 800000, p50: 1400000, p75: 2300000, p90: 3500000, growth: 18, demand: 'warm' },
  { role: 'Product Manager', p25: 1000000, p50: 1800000, p75: 2800000, p90: 4200000, growth: 12, demand: 'warm' },
  { role: 'Full Stack Developer', p25: 750000, p50: 1300000, p75: 2100000, p90: 3000000, growth: 16, demand: 'hot' },
  { role: 'iOS/Android Developer', p25: 700000, p50: 1200000, p75: 1900000, p90: 2800000, growth: 10, demand: 'warm' },
  { role: 'Cloud Architect', p25: 1500000, p50: 2500000, p75: 3800000, p90: 5500000, growth: 25, demand: 'hot' },
  { role: 'Security Engineer', p25: 1100000, p50: 1900000, p75: 3000000, p90: 4500000, growth: 22, demand: 'hot' },
];

const SCRIPTS: NegotiationScript[] = [
  {
    id: 'counter-1',
    phase: 'counter',
    scenario: 'Company offers 15% below your expected CTC',
    opener: '"Thank you so much for the offer — I\'m genuinely excited about [Company] and the [role] position. I\'ve reviewed the package carefully."',
    body: '"Based on my research of market benchmarks for this role and level, and considering my [X years] of experience with [specific skills], I was expecting a total compensation closer to ₹[target]. This accounts for base, bonus, and equity components."',
    closer: '"I\'m confident we can find a number that works for both of us. Would you be open to discussing an adjustment?"',
    tips: [
      'Always express enthusiasm first',
      'Reference specific market data',
      'Mention competing offers if you have them',
      'Be specific with a number, not a range'
    ],
    risk: 'low',
    expectedUplift: '10-20%'
  },
  {
    id: 'compete-1',
    phase: 'initial',
    scenario: 'You have a competing offer from another company',
    opener: '"I appreciate the offer from [Company]. I want to be transparent — I\'m also in advanced discussions with another company, and they\'ve presented a package of ₹[amount]."',
    body: '"I\'d strongly prefer to join [Company] because [specific reasons — team, mission, technology]. However, I need the compensation to reflect my market value. Could you match or exceed ₹[competing amount]?"',
    closer: '"What can we do to make this work? I want to start as soon as possible."',
    tips: [
      'Only mention real competing offers',
      'Never bluff — companies talk to each other',
      'Emphasize preference for THIS company',
      'Set a deadline (tactfully)'
    ],
    risk: 'medium',
    expectedUplift: '15-25%'
  },
  {
    id: 'close-1',
    phase: 'close',
    scenario: 'Finalizing the offer after negotiation',
    opener: '"I\'m thrilled about the revised package — thank you for working with me on this. Let me confirm the details."',
    body: '"I want to make sure I have the complete picture: base salary of ₹[X], joining bonus of ₹[Y], equity/ESOPs of [Z shares], annual bonus target of [N]%, and [other perks]. Is this accurate?"',
    closer: '"Perfect. I\'ll review the formal offer letter and get back to you by [date]. One more thing — could we include [accelerated vesting / sign-on bonus / remote flexibility] in writing?"',
    tips: [
      'Get EVERYTHING in writing',
      'Verify the complete comp breakdown',
      'Negotiate one more item at closing',
      'Set a clear timeline for acceptance'
    ],
    risk: 'low',
    expectedUplift: '5-10%'
  },
  {
    id: 'renegotiate-1',
    phase: 'renegotiate',
    scenario: 'Salary review after 6 months of exceptional performance',
    opener: '"I\'d like to schedule time to discuss my compensation. I\'ve been here 6 months and want to share some impact metrics."',
    body: '"Since joining, I\'ve [specific achievements: shipped X feature, reduced Y by Z%, mentored N people]. These exceed what was outlined in my initial performance goals. I\'ve also taken on [additional responsibilities]. Based on this, I\'d like to discuss an off-cycle salary adjustment."',
    closer: '"I\'m looking for a [X%] adjustment to bring my base to ₹[target]. I\'ve prepared a detailed document of my contributions. Can we discuss this next week?"',
    tips: [
      'Quantify EVERYTHING',
      'Prepare a written impact document',
      'Time it right — after a big win',
      'Be direct, not apologetic'
    ],
    risk: 'medium',
    expectedUplift: '10-30%'
  }
];

const COUNTER_OFFERS: CounterOffer[] = [
  {
    scenario: 'Low-ball initial offer',
    companyOffer: '₹12 LPA',
    yourAsk: '₹18 LPA',
    strategy: 'Anchor high with market data, then negotiate components individually',
    timeline: 'Response within 3-5 business days',
    template: '"Thank you for the offer. Based on market data for [role] with [X years] experience, the range is ₹15-22 LPA. I\'d like to discuss bringing the package to ₹18 LPA, potentially through base adjustment or equity supplementation."',
    successRate: '72%'
  },
  {
    scenario: 'Equal offer, better equity elsewhere',
    companyOffer: '₹20 LPA base, 0.01% ESOPs',
    yourAsk: '₹20 LPA base, 0.05% ESOPs',
    strategy: 'Negotiate equity specifically — highlight long-term value alignment',
    timeline: 'Response within 1 week',
    template: '"The base is competitive, but I\'d like to discuss the equity component. Given my expected tenure and the company\'s growth trajectory, a higher ESOP allocation would better align my incentives with the company\'s success. Could we discuss 0.05%?"',
    successRate: '58%'
  },
  {
    scenario: 'Salary bump but no joining bonus',
    companyOffer: '₹15 LPA, no sign-on',
    yourAsk: '₹15 LPA + ₹2L sign-on',
    strategy: 'Frame as transition cost — existing company bonus, relocation, etc.',
    timeline: 'Response within 3 business days',
    template: '"I appreciate the base adjustment. However, I\'ll be forfeiting ₹[amount] in vesting/bonus at my current company. A joining bonus of ₹2L would help bridge that gap and make the transition smoother. Can we include that?"',
    successRate: '65%'
  },
  {
    scenario: 'Offer rescinded threat (be careful)',
    companyOffer: '"Take it or leave it"',
    yourAsk: 'Respectful counter with data',
    strategy: 'De-escalate, reaffirm interest, make a smaller ask',
    timeline: 'Immediate response',
    template: '"I understand the constraints, and I want to be clear — I\'m very excited about this role. I withdraw my previous request. Could we perhaps revisit the annual bonus target from 10% to 15%? That would be sufficient for me to sign today."',
    successRate: '45%'
  }
];

const TACTICS: NegotiationTactic[] = [
  { name: 'The Flinch', category: 'silence', effectiveness: 85, description: 'React with subtle surprise to the initial offer, then stay silent. The discomfort often prompts the other side to improve it.', example: '"Hmm... *pause* I see." (then wait 10 seconds)', doThis: 'Let silence work for you', avoidThis: 'Never fill the silence with concessions' },
  { name: 'The Anchor', category: 'anchor', effectiveness: 90, description: 'Set the first number high (but defensible) so all subsequent negotiations happen closer to your target.', example: '"Based on my research, the market range is ₹18-25 LPA for this role."', doThis: 'Always anchor with data', avoidThis: 'Never anchor without justification' },
  { name: 'The Nibble', category: 'trade', effectiveness: 75, description: 'After agreement on the main deal, ask for one small additional item — the other side is motivated to close.', example: '"One last thing — could we include a one-time home office allowance?"', doThis: 'Ask for something small and specific', avoidThis: 'Don\'t nibble for major items' },
  { name: 'The Breakup', category: 'leverage', effectiveness: 80, description: 'Genuinely signal willingness to walk away. Only works if you actually have alternatives.', example: '"I appreciate the offer, but this doesn\'t align with my requirements. I\'ll need to decline unless we can bridge the gap."', doThis: 'Only use if you mean it', avoidThis: 'Never bluff about walking away' },
  { name: 'The Bracket', category: 'anchor', effectiveness: 70, description: 'If they offer ₹X and you want ₹Y, propose a midpoint that favors you slightly.', example: '"You offered ₹12, I was expecting ₹18. How about we meet at ₹16?"', doThis: 'Calculate midpoint that favors you', avoidThis: 'Don\'t bracket if their offer is already fair' },
  { name: 'The Future Frame', category: 'framing', effectiveness: 88, description: 'Frame the negotiation as a partnership for mutual future success, not a zero-sum battle.', example: '"I want to set us both up for success. When I\'m properly compensated, I\'m fully focused and motivated to deliver exceptional results."', doThis: 'Emphasize mutual benefit', avoidThis: 'Don\'t make it adversarial' },
];

// ─── Utility ────────────────────────────────────────────────
const fmt = (n: number) => '₹' + (n / 100000).toFixed(1) + 'L';
const fmtFull = (n: number) => '₹' + n.toLocaleString('en-IN');
const pctBar = (val: number, max: number) => Math.min((val / max) * 100, 100);

// ─── Sub-Components ─────────────────────────────────────────
const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
      active
        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub?: string; color: string }> = ({ icon, label, value, sub, color }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-2xl font-black text-white">{value}</div>
    {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
  </div>
);

const Bar: React.FC<{ value: number; max: number; color: string; label?: string; showVal?: string }> = ({ value, max, color, label, showVal }) => (
  <div className="space-y-1">
    {label && <div className="flex justify-between text-xs"><span className="text-gray-400">{label}</span><span className="text-gray-300 font-semibold">{showVal}</span></div>}
    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pctBar(value, max)}%` }} />
    </div>
  </div>
);

const Badge: React.FC<{ text: string; variant: 'low' | 'medium' | 'high' | 'hot' | 'warm' | 'cold' }> = ({ text, variant }) => {
  const colors: Record<string, string> = {
    low: 'bg-emerald-500/20 text-emerald-400',
    medium: 'bg-amber-500/20 text-amber-400',
    high: 'bg-red-500/20 text-red-400',
    hot: 'bg-red-500/20 text-red-400',
    warm: 'bg-amber-500/20 text-amber-400',
    cold: 'bg-blue-500/20 text-blue-400',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${colors[variant]}`}>{text}</span>;
};

// ─── Main Component ─────────────────────────────────────────
const SalaryNegotiationCoach: React.FC = () => {
  const [tab, setTab] = useState<'benchmarks' | 'scripts' | 'counter' | 'tactics' | 'simulator'>('benchmarks');
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState(0);
  const [expandedScript, setExpandedScript] = useState<string | null>(null);
  const [expandedTactic, setExpandedTactic] = useState<string | null>(null);
  const [expandedCounter, setExpandedCounter] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Simulator state
  const [simRole, setSimRole] = useState('Frontend Developer');
  const [simExp, setSimExp] = useState(3);
  const [simOffer, setSimOffer] = useState(12);
  const [simCompete, setSimCompete] = useState(false);
  const [simResult, setSimResult] = useState<null | { suggested: number; strategy: string; scripts: string[] }>(null);

  const filteredBenchmarks = useMemo(() =>
    MARKET_BENCHS.filter(b => b.role.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const filteredData = useMemo(() =>
    SALARY_DATA.filter(d => d.role.toLowerCase().includes(search.toLowerCase()) || d.company.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const runSimulation = () => {
    const bench = MARKET_BENCHS.find(b => b.role === simRole) || MARKET_BENCHS[0];
    const expMultiplier = 1 + (simExp - 1) * 0.08;
    const suggested = Math.round((bench.p50 * expMultiplier) / 100000) * 100000;
    const competingBonus = simCompete ? 0.1 : 0;

    const strategies: string[] = [];
    if (simOffer * 100000 < suggested * 0.8) {
      strategies.push('Strong anchor with market data — you\'re being under-offered significantly');
    }
    if (simCompete) {
      strategies.push('Leverage competing offer as your primary negotiation tool');
    }
    strategies.push('Request base adjustment first, then equity/bonus if base is maxed');
    if (simExp >= 5) {
      strategies.push('Negotiate sign-on bonus to offset vesting cliff at current company');
    }

    setSimResult({
      suggested: Math.round(suggested * (1 + competingBonus) / 100000) * 100,
      strategy: strategies.join(' → '),
      scripts: [
        `"Based on current market data for ${simRole} with ${simExp} years experience, the median is ₹${(suggested / 100000).toFixed(1)}L. I\'d like to discuss bringing the package to ₹${(suggested * (1 + competingBonus) / 100000).toFixed(1)}L."`,
        `"I\'m targeting the 75th percentile for this role, which is ₹${(bench.p75 / 100000).toFixed(1)}L. Given my track record, I believe this is justified."`,
        `"Could we structure the package with a higher equity component? This would align my incentives with the company\'s long-term growth."`
      ]
    });
  };

  // ─── TABS ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
            <Handshake size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Salary Negotiation Coach</h1>
            <p className="text-gray-400 text-sm mt-1">Market data, scripts, counter-offer strategies & negotiation tactics</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<BarChart3 size={20} />} label="Avg Uplift" value="+19%" sub="When negotiated" color="bg-emerald-500/20" />
          <StatCard icon={<Target size={20} />} label="Success Rate" value="72%" sub="With data-backed approach" color="bg-blue-500/20" />
          <StatCard icon={<DollarSign size={20} />} label="Market Data" value={`${SALARY_DATA.length}+`} sub="Real offers analyzed" color="bg-amber-500/20" />
          <StatCard icon={<Brain size={20} />} label="Strategies" value={`${TACTICS.length}`} sub="Proven tactics" color="bg-purple-500/20" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <TabButton active={tab === 'benchmarks'} onClick={() => setTab('benchmarks')} icon={<BarChart3 size={16} />} label="Market Benchmarks" />
          <TabButton active={tab === 'scripts'} onClick={() => setTab('scripts')} icon={<MessageSquare size={16} />} label="Scripts" />
          <TabButton active={tab === 'counter'} onClick={() => setTab('counter')} icon={<RefreshCw size={16} />} label="Counter Offers" />
          <TabButton active={tab === 'tactics'} onClick={() => setTab('tactics')} icon={<Zap size={16} />} label="Tactics" />
          <TabButton active={tab === 'simulator'} onClick={() => setTab('simulator')} icon={<Calculator size={16} />} label="Simulator" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search roles, companies, or tactics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
          />
        </div>

        {/* ── Market Benchmarks Tab ── */}
        {tab === 'benchmarks' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-emerald-400" /> Salary Percentiles by Role
            </h2>
            {filteredBenchmarks.map((b, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-sm">{i + 1}</div>
                    <div>
                      <h3 className="font-bold text-white">{b.role}</h3>
                      <span className="text-xs text-gray-500">YoY Growth: <span className="text-emerald-400 font-semibold">+{b.growth}%</span></span>
                    </div>
                  </div>
                  <Badge text={b.demand} variant={b.demand} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {[
                    { label: 'P25', val: b.p25, color: 'bg-gray-500' },
                    { label: 'P50 (Median)', val: b.p50, color: 'bg-blue-500' },
                    { label: 'P75', val: b.p75, color: 'bg-emerald-500' },
                    { label: 'P90', val: b.p90, color: 'bg-amber-500' },
                  ].map((p, j) => (
                    <div key={j} className="text-center">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{p.label}</div>
                      <div className="text-lg font-black text-white">{fmt(p.val)}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Bar value={b.p25} max={6000000} color="bg-gray-500" label={`P25: ${fmt(b.p25)}`} showVal={`${fmt(b.p25)}`} />
                  <Bar value={b.p50} max={6000000} color="bg-blue-500" label={`P50: ${fmt(b.p50)}`} showVal={`${fmt(b.p50)}`} />
                  <Bar value={b.p75} max={6000000} color="bg-emerald-500" label={`P75: ${fmt(b.p75)}`} showVal={`${fmt(b.p75)}`} />
                  <Bar value={b.p90} max={6000000} color="bg-amber-500" label={`P90: ${fmt(b.p90)}`} showVal={`${fmt(b.p90)}`} />
                </div>
              </div>
            ))}

            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-8">
              <Award size={20} className="text-amber-400" /> Real Negotiation Outcomes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredData.map((d, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-emerald-500/20 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-white">{d.role}</h4>
                      <p className="text-xs text-gray-500">{d.company} · {d.location} · {d.level}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">{d.negotiationResult}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: 'Base', val: fmt(d.base), color: 'text-blue-400' },
                      { label: 'Bonus', val: fmt(d.bonus), color: 'text-emerald-400' },
                      { label: 'Equity', val: fmt(d.equity), color: 'text-purple-400' },
                      { label: 'Total', val: fmt(d.total), color: 'text-amber-400' },
                    ].map((c, j) => (
                      <div key={j}>
                        <div className="text-[10px] text-gray-500 uppercase">{c.label}</div>
                        <div className={`text-sm font-bold ${c.color}`}>{c.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Scripts Tab ── */}
        {tab === 'scripts' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-400" /> Negotiation Scripts
            </h2>
            <div className="flex gap-2 flex-wrap mb-4">
              {['all', 'initial', 'counter', 'close', 'renegotiate'].map(phase => (
                <button
                  key={phase}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all capitalize"
                >
                  {phase === 'all' ? 'All Phases' : phase}
                </button>
              ))}
            </div>
            {SCRIPTS.map(s => (
              <div key={s.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-500/20 transition-all">
                <div className="flex items-start justify-between gap-4 mb-4 cursor-pointer" onClick={() => setExpandedScript(expandedScript === s.id ? null : s.id)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge text={s.phase} variant={s.phase === 'close' || s.phase === 'initial' ? 'low' : s.phase === 'counter' ? 'medium' : 'high'} />
                      <Badge text={`Risk: ${s.risk}`} variant={s.risk as any} />
                      <span className="text-xs text-emerald-400 font-semibold">↑ {s.expectedUplift}</span>
                    </div>
                    <h3 className="font-bold text-white text-lg">{s.scenario}</h3>
                  </div>
                  <div className="text-gray-400">{expandedScript === s.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}</div>
                </div>

                {expandedScript === s.id && (
                  <div className="space-y-4 mt-4 border-t border-white/10 pt-4">
                    {[
                      { label: '📌 Opener', text: s.opener, color: 'border-l-blue-500' },
                      { label: '💬 Body', text: s.body, color: 'border-l-emerald-500' },
                      { label: '🤝 Closer', text: s.closer, color: 'border-l-amber-500' },
                    ].map((part, i) => (
                      <div key={i} className={`border-l-4 ${part.color} pl-4 py-2`}>
                        <div className="text-xs font-semibold text-gray-400 mb-1">{part.label}</div>
                        <p className="text-sm text-gray-200 italic leading-relaxed">{part.text}</p>
                        <button
                          onClick={() => copyText(part.text, `${s.id}-${i}`)}
                          className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-400 transition-colors"
                        >
                          <Copy size={12} />
                          {copiedId === `${s.id}-${i}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    ))}
                    <div className="mt-4">
                      <div className="text-xs font-semibold text-gray-400 mb-2">💡 Pro Tips</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {s.tips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                            {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Counter Offers Tab ── */}
        {tab === 'counter' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RefreshCw size={20} className="text-amber-400" /> Counter Offer Playbook
            </h2>
            {COUNTER_OFFERS.map((co, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-amber-500/20 transition-all">
                <div className="flex items-start justify-between gap-4 mb-4 cursor-pointer" onClick={() => setExpandedCounter(expandedCounter === i ? null : i)}>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-2">{co.scenario}</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Their Offer</div>
                        <div className="text-sm font-bold text-red-400">{co.companyOffer}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Your Ask</div>
                        <div className="text-sm font-bold text-emerald-400">{co.yourAsk}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Success Rate</div>
                        <div className="text-sm font-bold text-amber-400">{co.successRate}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400">{expandedCounter === i ? <ChevronDown size={20} /> : <ChevronRight size={20} />}</div>
                </div>

                {expandedCounter === i && (
                  <div className="space-y-4 mt-4 border-t border-white/10 pt-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-2">🎯 Strategy</div>
                      <p className="text-sm text-gray-200">{co.strategy}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-2">⏰ Timeline</div>
                      <p className="text-sm text-gray-200 flex items-center gap-2"><Clock size={14} className="text-amber-400" />{co.timeline}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 mb-2">📝 Response Template</div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-sm text-gray-200 italic leading-relaxed">{co.template}</p>
                        <button
                          onClick={() => copyText(co.template, `counter-${i}`)}
                          className="mt-3 flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-400 transition-colors"
                        >
                          <Copy size={12} />
                          {copiedId === `counter-${i}` ? 'Copied!' : 'Copy Template'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Tactics Tab ── */}
        {tab === 'tactics' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap size={20} className="text-purple-400" /> Proven Negotiation Tactics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TACTICS.map((t, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-purple-500/20 transition-all">
                  <div className="flex items-start justify-between mb-3 cursor-pointer" onClick={() => setExpandedTactic(expandedTactic === t.name ? null : t.name)}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white">{t.name}</h3>
                        <Badge text={t.category} variant={t.category === 'leverage' ? 'hot' : t.category === 'anchor' ? 'warm' : t.category === 'silence' ? 'medium' : t.category === 'trade' ? 'low' : 'cold'} />
                      </div>
                      <p className="text-xs text-gray-400">{t.description}</p>
                    </div>
                    <div className="text-gray-400">{expandedTactic === t.name ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>Effectiveness</span>
                      <span className="text-emerald-400 font-bold">{t.effectiveness}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                        style={{ width: `${t.effectiveness}%` }}
                      />
                    </div>
                  </div>

                  {expandedTactic === t.name && (
                    <div className="space-y-3 mt-3 border-t border-white/10 pt-3">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-[10px] text-gray-500 uppercase mb-1">Example</div>
                        <p className="text-sm text-gray-200 italic">{t.example}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/20">
                          <div className="text-[10px] text-emerald-400 uppercase font-semibold mb-1">✅ Do This</div>
                          <p className="text-xs text-gray-300">{t.doThis}</p>
                        </div>
                        <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20">
                          <div className="text-[10px] text-red-400 uppercase font-semibold mb-1">❌ Avoid This</div>
                          <p className="text-xs text-gray-300">{t.avoidThis}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Simulator Tab ── */}
        {tab === 'simulator' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calculator size={20} className="text-emerald-400" /> Salary Negotiation Simulator
            </h2>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Role</label>
                    <select
                      value={simRole}
                      onChange={e => setSimRole(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                    >
                      {MARKET_BENCHS.map((b, i) => <option key={i} value={b.role} className="bg-gray-900">{b.role}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Years of Experience: {simExp}</label>
                    <input type="range" min="1" max="15" value={simExp} onChange={e => setSimExp(+e.target.value)} className="w-full accent-emerald-500" />
                    <div className="flex justify-between text-[10px] text-gray-500"><span>1 year</span><span>15 years</span></div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Company Offer (₹ LPA): {simOffer}</label>
                    <input type="range" min="3" max="60" value={simOffer} onChange={e => setSimOffer(+e.target.value)} className="w-full accent-emerald-500" />
                    <div className="flex justify-between text-[10px] text-gray-500"><span>₹3L</span><span>₹60L</span></div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={simCompete} onChange={e => setSimCompete(e.target.checked)} className="w-4 h-4 accent-emerald-500 rounded" />
                    <span className="text-sm text-gray-300">I have a competing offer</span>
                  </label>
                </div>

                <div className="flex flex-col justify-center items-center">
                  <button
                    onClick={runSimulation}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all flex items-center gap-2"
                  >
                    <Zap size={20} />
                    Run Simulation
                  </button>
                  <p className="text-xs text-gray-500 mt-3 text-center">Get personalized negotiation strategy</p>
                </div>
              </div>
            </div>

            {simResult && (
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/30">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Award size={20} className="text-emerald-400" /> Your Negotiation Plan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                    <div className="text-[10px] text-gray-500 uppercase">Offer</div>
                    <div className="text-2xl font-black text-red-400">{simOffer} LPA</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                    <div className="text-[10px] text-gray-500 uppercase">Suggested Target</div>
                    <div className="text-2xl font-black text-emerald-400">{(simResult.suggested / 100).toFixed(1)} LPA</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                    <div className="text-[10px] text-gray-500 uppercase">Potential Uplift</div>
                    <div className="text-2xl font-black text-amber-400">+{Math.round(((simResult.suggested / 100 - simOffer) / simOffer) * 100)}%</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-gray-400 mb-2">🎯 Strategy Path</div>
                    <p className="text-sm text-gray-200 bg-white/5 rounded-xl p-4 border border-white/10">{simResult.strategy}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400 mb-2">📝 Suggested Scripts</div>
                    <div className="space-y-3">
                      {simResult.scripts.map((s, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                          <p className="text-sm text-gray-200 italic flex-1">{s}</p>
                          <button onClick={() => copyText(s, `sim-${i}`)} className="text-gray-500 hover:text-emerald-400 transition-colors flex-shrink-0">
                            <Copy size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Lightbulb size={20} className="text-amber-400" /> Key Negotiation Principles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: <Brain size={18} />, title: 'Never Accept First Offer', desc: '73% of employers expect negotiation. Accepting the first offer leaves money on the table.' },
                  { icon: <BarChart3 size={18} />, title: 'Use Data, Not Emotion', desc: 'Always reference Glassdoor, AmbitionBox, or Levels.fyi data for your role and location.' },
                  { icon: <Clock size={18} />, title: 'Take Your Time', desc: 'Ask for 3-5 business days to review. This shows professionalism and gives you leverage.' },
                  { icon: <Handshake size={18} />, title: 'Negotiate Total, Not Base', desc: 'Signing bonus, equity, WFH allowance, and L&D budget are all negotiable components.' },
                ].map((p, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">{p.icon}</div>
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">{p.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12 text-center text-xs text-gray-600 pb-8">
        Data sourced from Glassdoor, AmbitionBox, Levels.fyi, and verified offers · Negotiate with confidence 💪
      </div>
    </div>
  );
};

export default SalaryNegotiationCoach;

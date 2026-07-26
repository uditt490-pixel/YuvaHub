import React, { useState, useEffect } from 'react';
import {
  Rocket,
  TrendingUp,
  Brain,
  Target,
  Users,
  Award,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  BarChart3,
  FileText,
  Clock,
  Briefcase
} from 'lucide-react';
import { ProjectIncubation, AIVentureEvaluation } from '../../models/incubationSchema';

export default function ProjectIncubationStudio() {
  const [activeTab, setActiveTab] = useState<'discover' | 'submit' | 'evaluator' | 'roadmap'>('discover');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [projects, setProjects] = useState<ProjectIncubation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<AIVentureEvaluation | null>(null);

  // Form State for Proposal Submission
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    problemStatement: '',
    solutionOverview: '',
    targetMarket: '',
    category: 'AI & Machine Learning',
    stage: 'Ideation',
    fundingRequestedINR: 100000,
    valuationINR: 1000000,
    githubRepoUrl: '',
    demoVideoUrl: ''
  });

  // Seed sample incubation projects for instant rich visualization
  const sampleProjects: ProjectIncubation[] = [
    {
      id: 'inc_1',
      title: 'DevPulse AI',
      tagline: 'Autonomous AI Code Reviewer and Security Inspector for Student Repositories',
      problemStatement: 'Student developers lack real-time enterprise-grade code security reviews and architectural feedback before submitting hackathons.',
      solutionOverview: 'AI agent that runs automated static vulnerability audits, AST tree parsing, and optimization benchmark summaries on pull requests.',
      targetMarket: '1.2M CS Students & Hackathon Participants in South Asia',
      category: 'AI & Machine Learning',
      stage: 'MVP Built',
      teamMembers: [
        { name: 'Aarav Sharma', role: 'Full Stack AI Lead', email: 'aarav@yuvahub.xyz' },
        { name: 'Priya Verma', role: 'Backend Systems Engineer' }
      ],
      fundingRequestedINR: 250000,
      valuationINR: 2500000,
      aiFeasibilityScore: 92,
      aiTractionScore: 84,
      aiMarketScore: 90,
      milestones: [
        { title: 'Alpha Release & GitHub Bot', description: 'Deploy Probot integration', targetDate: '2026-08-15', fundingAllocation: 50000, status: 'Completed', deliverables: ['Probot webhook handler', 'AST analyzer module'] },
        { title: 'Beta Testing with 50 Campus Teams', description: 'Onboard top hackathon winners', targetDate: '2026-09-30', fundingAllocation: 75000, status: 'In Progress', deliverables: ['Usage telemetry dashboard', 'Sentry logging'] }
      ],
      pitchDeckSlideCount: 12,
      githubRepoUrl: 'https://github.com/yuvahub/devpulse-ai',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'inc_2',
      title: 'EduSphere AR',
      tagline: 'Interactive 3D Spatial Anatomy and Robotics Simulations for STEM Classrooms',
      problemStatement: 'Tier-2 and Tier-3 engineering colleges lack expensive hardware robotics labs and medical dissecting equipment.',
      solutionOverview: 'WebXR browser-based spatial lab simulator that lets students program robotic arms and perform virtual physics experiments.',
      targetMarket: 'Higher Education Engineering Colleges and STEM Institutions',
      category: 'EdTech & Student Productivity',
      stage: 'Prototype',
      teamMembers: [
        { name: 'Rohan Gupta', role: '3D Graphics Engine Lead' },
        { name: 'Neha Patel', role: 'Educational Content Strategist' }
      ],
      fundingRequestedINR: 150000,
      valuationINR: 1500000,
      aiFeasibilityScore: 88,
      aiTractionScore: 76,
      aiMarketScore: 86,
      milestones: [
        { title: 'Three.js Shader Optimization', description: '60FPS rendering on budget smartphones', targetDate: '2026-09-01', fundingAllocation: 50000, status: 'In Progress', deliverables: ['GLTF loader pipeline'] }
      ],
      pitchDeckSlideCount: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'inc_3',
      title: 'EcoChain Ledger',
      tagline: 'Decentralized Carbon Credit Verification Protocol for Student Campus Initiatives',
      problemStatement: 'Campus sustainability projects cannot transparently verify carbon offset tokens or issue audited green certificates.',
      solutionOverview: 'Solidity zero-knowledge proof smart contract suite that verifies solar panel generation and recycling metrics on-chain.',
      targetMarket: 'Universities and Corporate ESG Auditors',
      category: 'CleanTech & Sustainability',
      stage: 'Early Traction',
      teamMembers: [
        { name: 'Vikram Mehta', role: 'Smart Contract Developer' }
      ],
      fundingRequestedINR: 300000,
      valuationINR: 3500000,
      aiFeasibilityScore: 86,
      aiTractionScore: 89,
      aiMarketScore: 88,
      milestones: [
        { title: 'Smart Contract Audit', description: 'Third-party security audit by CertiK', targetDate: '2026-10-15', fundingAllocation: 100000, status: 'Pending', deliverables: ['Audit report', 'Mainnet deployment'] }
      ],
      pitchDeckSlideCount: 14,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  useEffect(() => {
    fetchIncubationProjects();
  }, []);

  const fetchIncubationProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/incubation/projects');
      const data = await res.json();
      if (data.success && data.projects && data.projects.length > 0) {
        setProjects(data.projects);
      } else {
        setProjects(sampleProjects);
      }
    } catch {
      setProjects(sampleProjects);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'fundingRequestedINR' || name === 'valuationINR' ? Number(value) : value
    }));
  };

  const handleEvaluateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluating(true);
    setEvaluationResult(null);

    try {
      const res = await fetch('/api/incubation/ai-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setEvaluationResult(data.evaluation);
        setActiveTab('evaluator');
      }
    } catch (err) {
      console.error('AI evaluation failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/incubation/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('🎉 Venture Proposal submitted to YuvaHub Incubation Board successfully!');
        setFormData({
          title: '',
          tagline: '',
          problemStatement: '',
          solutionOverview: '',
          targetMarket: '',
          category: 'AI & Machine Learning',
          stage: 'Ideation',
          fundingRequestedINR: 100000,
          valuationINR: 1000000,
          githubRepoUrl: '',
          demoVideoUrl: ''
        });
        fetchIncubationProjects();
        setActiveTab('discover');
      }
    } catch (err) {
      console.error('Submission error:', err);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchStage = selectedStage === 'All' || p.stage === selectedStage;
    return matchCategory && matchStage;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-8 border border-indigo-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> YuvaHub Venture Studio & Accelerator
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Turn Student Hackathon Projects into Scalable Startups
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl leading-relaxed">
            Submit your project proposal for AI venture scoring, equity-free milestone grants, institutional mentor assignment, and direct demo day matching with leading angel investors.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-indigo-500/20">
            <div>
              <div className="text-2xl font-bold text-indigo-400">₹2.5Cr+</div>
              <div className="text-xs text-slate-400">Incubation Fund Pool</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">140+</div>
              <div className="text-xs text-slate-400">Active Student Startups</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">94.8%</div>
              <div className="text-xs text-slate-400">AI Evaluation Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">45+</div>
              <div className="text-xs text-slate-400">VC Mentors Onboarded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-slate-800 pb-3">
        {[
          { id: 'discover', label: 'Incubated Ventures', icon: Rocket },
          { id: 'submit', label: 'Submit Proposal', icon: Plus },
          { id: 'evaluator', label: 'AI Venture Evaluator', icon: Brain },
          { id: 'roadmap', label: 'Milestone Roadmap', icon: Target }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DISCOVER VENTURES */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category:</span>
              {['All', 'AI & Machine Learning', 'EdTech & Student Productivity', 'FinTech & Web3', 'CleanTech & Sustainability'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stage:</span>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                aria-label="Filter incubation projects by stage"
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Stages</option>
                <option value="Ideation">Ideation</option>
                <option value="Prototype">Prototype</option>
                <option value="MVP Built">MVP Built</option>
                <option value="Early Traction">Early Traction</option>
              </select>
            </div>
          </div>

          {/* Grid of Projects */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Loading incubation ventures...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-indigo-500/10 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {p.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.stage}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {p.tagline}
                    </p>

                    {/* AI Scorecard Mini Pills */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                      <div className="bg-slate-950 p-2 rounded-lg text-center">
                        <div className="text-xs text-slate-400">Feasibility</div>
                        <div className="text-sm font-bold text-indigo-400">{p.aiFeasibilityScore}/100</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg text-center">
                        <div className="text-xs text-slate-400">Traction</div>
                        <div className="text-sm font-bold text-emerald-400">{p.aiTractionScore}/100</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg text-center">
                        <div className="text-xs text-slate-400">Market</div>
                        <div className="text-sm font-bold text-purple-400">{p.aiMarketScore}/100</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Grant Requested:</span>
                      <span className="font-bold text-white">₹{p.fundingRequestedINR?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Valuation Floor:</span>
                      <span className="font-bold text-emerald-400">₹{p.valuationINR?.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {p.githubRepoUrl && (
                        <a
                          href={p.githubRepoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 text-center py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Repository
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setFormData({
                            title: p.title,
                            tagline: p.tagline,
                            problemStatement: p.problemStatement,
                            solutionOverview: p.solutionOverview,
                            targetMarket: p.targetMarket,
                            category: p.category as any,
                            stage: p.stage as any,
                            fundingRequestedINR: p.fundingRequestedINR,
                            valuationINR: p.valuationINR,
                            githubRepoUrl: p.githubRepoUrl || '',
                            demoVideoUrl: p.demoVideoUrl || ''
                          });
                          setActiveTab('submit');
                        }}
                        className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        Inspect & Edit <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUBMIT PROPOSAL */}
      {activeTab === 'submit' && (
        <div className="max-w-3xl mx-auto bg-slate-900/90 rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Rocket className="w-6 h-6 text-indigo-400" /> Venture Incubation Proposal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Provide your venture specs to request incubator milestone grants and trigger automated AI pitch scoring.
            </p>
          </div>

          <form onSubmit={handleSubmitProposal} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. DevPulse AI"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  aria-label="Select venture category"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="EdTech & Student Productivity">EdTech & Student Productivity</option>
                  <option value="FinTech & Web3">FinTech & Web3</option>
                  <option value="HealthTech & BioTech">HealthTech & BioTech</option>
                  <option value="CleanTech & Sustainability">CleanTech & Sustainability</option>
                  <option value="Developer Tools & SaaS">Developer Tools & SaaS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">One-Line Tagline</label>
              <input
                type="text"
                name="tagline"
                required
                value={formData.tagline}
                onChange={handleInputChange}
                placeholder="e.g. Autonomous AI Code Reviewer and Security Inspector for Student Repositories"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Problem Statement</label>
              <textarea
                name="problemStatement"
                rows={3}
                required
                value={formData.problemStatement}
                onChange={handleInputChange}
                placeholder="What critical friction or gap are you solving?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Solution Overview</label>
              <textarea
                name="solutionOverview"
                rows={3}
                required
                value={formData.solutionOverview}
                onChange={handleInputChange}
                placeholder="How does your technology/product solve this problem?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Incubation Stage</label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleInputChange}
                  aria-label="Select incubation stage"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Ideation">Ideation</option>
                  <option value="Prototype">Prototype</option>
                  <option value="MVP Built">MVP Built</option>
                  <option value="Early Traction">Early Traction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Grant Requested (INR)</label>
                <input
                  type="number"
                  name="fundingRequestedINR"
                  value={formData.fundingRequestedINR}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pre-Money Valuation (INR)</label>
                <input
                  type="number"
                  name="valuationINR"
                  value={formData.valuationINR}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleEvaluateAI}
                disabled={evaluating}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
              >
                {evaluating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Brain className="w-4 h-4" />}
                Evaluate Pitch with AI
              </button>

              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <Rocket className="w-4 h-4" /> Submit Proposal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: AI EVALUATION REPORT */}
      {activeTab === 'evaluator' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {!evaluationResult ? (
            <div className="bg-slate-900/80 rounded-3xl p-12 text-center border border-slate-800 space-y-4">
              <Brain className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
              <h3 className="text-xl font-bold text-white">No AI Evaluation Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Fill in your project proposal details in the &quot;Submit Proposal&quot; tab and click &quot;Evaluate Pitch with AI&quot; to run an automated venture analysis.
              </p>
              <button
                onClick={() => setActiveTab('submit')}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white"
              >
                Go to Proposal Submission
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/90 rounded-3xl p-8 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-400" /> AI Venture Evaluation Report
                  </h2>
                  <p className="text-xs text-slate-400">Generated by YuvaHub Gemini 2.5 Flash Venture Engine</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-emerald-400">{evaluationResult.overallViabilityScore}/100</div>
                  <div className="text-xs text-slate-400">Viability Score</div>
                </div>
              </div>

              {/* Grid Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-semibold mb-1">Architectural Feasibility</div>
                  <div className="text-sm text-slate-200">{evaluationResult.feasibilityRating}</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-semibold mb-1">Market Opportunity</div>
                  <div className="text-sm text-slate-200">{evaluationResult.marketOpportunityRating}</div>
                </div>
              </div>

              {/* Strengths & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Core Venture Strengths
                  </h4>
                  <ul className="space-y-2">
                    {evaluationResult.keyStrengths.map((str, idx) => (
                      <li key={idx} className="bg-emerald-500/10 text-emerald-200 border border-emerald-500/20 p-3 rounded-xl text-xs">
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Risk Factors & Friction
                  </h4>
                  <ul className="space-y-2">
                    {evaluationResult.riskFactors.map((risk, idx) => (
                      <li key={idx} className="bg-amber-500/10 text-amber-200 border border-amber-500/20 p-3 rounded-xl text-xs">
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Funding Tier Recommendation */}
              <div className="bg-gradient-to-r from-indigo-950 to-purple-950 p-6 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-indigo-300 font-semibold uppercase">Recommended Milestone Grant Tier</div>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    ₹{evaluationResult.recommendedFundingTierINR?.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Grant Eligibility Score: <span className="text-emerald-400 font-bold">{evaluationResult.grantEligibilityScore}%</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('roadmap')}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/30 whitespace-nowrap"
                >
                  View Milestone Execution Roadmap
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MILESTONE ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" /> Incubator Milestone Execution Canvas
            </h3>
            <p className="text-xs text-slate-400">
              Track funding disbursement triggers linked directly to verifiable technical deliverables.
            </p>

            <div className="space-y-4 pt-4">
              {[
                { title: 'Milestone 1: Prototype Architecture & Schema Validation', amount: '₹50,000', status: 'Verified', date: 'Phase 1 - Complete' },
                { title: 'Milestone 2: Beta Launch with 100 Active Campus Testers', amount: '₹75,000', status: 'In Progress', date: 'Target: Aug 2026' },
                { title: 'Milestone 3: Third-Party Security Audit & IP Protection', amount: '₹1,25,000', status: 'Upcoming', date: 'Target: Oct 2026' }
              ].map((m, idx) => (
                <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl text-xs font-bold ${
                      m.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{m.title}</h4>
                      <div className="text-xs text-slate-400 mt-1">{m.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">{m.amount}</div>
                      <div className="text-[11px] text-slate-400">{m.status}</div>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200">
                      Submit Proof
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

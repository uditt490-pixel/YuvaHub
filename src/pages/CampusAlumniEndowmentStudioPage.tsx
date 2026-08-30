import React, { useState, useEffect } from 'react';
import { AlumniEndowmentEngine } from '../services/alumniEndowmentEngine';
import {
  fetchAlumniEndowments,
  createAlumniEndowment,
  contributeToAlumniEndowment,
} from '../services/apiClient';
import { CampusAlumniEndowmentCard } from '../components/endowment/CampusAlumniEndowmentCard';
import { CampusAlumniEndowmentTimeline } from '../components/endowment/CampusAlumniEndowmentTimeline';
import {
  GraduationCap,
  Search,
  Filter,
  PlusCircle,
  ShieldCheck,
  Activity,
  X,
  DollarSign,
} from 'lucide-react';

export default function CampusAlumniEndowmentStudioPage() {
  const [funds, setFunds] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    campusName: 'All',
    fundCategory: 'All',
    grantStatus: 'All',
    search: '',
  });

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newFundName, setNewFundName] = useState<string>('AI & Quantum Research Fellowship Fund');
  const [newCampus, setNewCampus] = useState<string>('IIT Bombay');
  const [newDonor, setNewDonor] = useState<string>('Rajesh Kumar');
  const [newBatch, setNewBatch] = useState<number>(2015);
  const [newCategory, setNewCategory] = useState<'RESEARCH_GRANT' | 'STUDENT_SCHOLARSHIP' | 'LAB_EQUIPMENT' | 'HACKATHON_SPONSORSHIP'>('RESEARCH_GRANT');
  const [newTarget, setNewTarget] = useState<string>('25000');
  const [newInitial, setNewInitial] = useState<string>('5000');
  const [newDesc, setNewDesc] = useState<string>('Supporting student researchers publishing high-impact papers in AI and Quantum Computing.');

  useEffect(() => {
    loadFunds();
  }, []);

  const loadFunds = async () => {
    try {
      const data = await fetchAlumniEndowments(filters);
      if (data && data.length > 0) {
        setFunds(data);
        return;
      }
    } catch (err) {
      console.warn('API fetchAlumniEndowments failed, using engine fallback', err);
    }
    const fallback = await AlumniEndowmentEngine.getEndowments(filters);
    setFunds(fallback);
  };

  const applyFilterChanges = async (updated: any) => {
    const next = { ...filters, ...updated };
    setFilters(next);
    try {
      const data = await fetchAlumniEndowments(next);
      if (data && data.length > 0) {
        setFunds(data);
        return;
      }
    } catch (err) {
      console.warn('API fetchAlumniEndowments failed, using engine fallback', err);
    }
    const fallback = await AlumniEndowmentEngine.getEndowments(next);
    setFunds(fallback);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTarget);
    const initial = parseFloat(newInitial);

    if (!Number.isFinite(target) || !Number.isFinite(initial)) {
      alert('Please enter valid amounts.');
      return;
    }

    const payload = {
      fundName: newFundName,
      campusName: newCampus,
      donorName: newDonor,
      donorAlumniBatchYear: newBatch,
      fundCategory: newCategory,
      targetAmountUsd: target,
      initialContributionUsd: initial,
      matchingGrantEnabled: true,
      matchingRatio: 1.5,
      description: newDesc,
    };

    try {
      await createAlumniEndowment(payload);
    } catch (err) {
      console.warn('API createAlumniEndowment failed, creating locally', err);
      await AlumniEndowmentEngine.createEndowment(payload);
    }
    await loadFunds();
    setShowCreateModal(false);
  };

  const handleDonate = async (id: string) => {
    try {
      await contributeToAlumniEndowment(id, 1000);
    } catch (err) {
      console.warn('API contributeToAlumniEndowment failed, contributing locally', err);
      await AlumniEndowmentEngine.contributeToFund(id, 1000);
    }
    await loadFunds();
  };

  return (
    <div className="min-h-screen  py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-400">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Enterprise Campus Alumni Endowment & Student Grant Studio
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Campus Alumni Endowment Studio
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Empower university alumni to endow student research grants, hackathon prizes, and lab equipment with matching corporate funds.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 text-sm"
              >
                <PlusCircle className="w-5 h-5 fill-current" />
                Launch Alumni Micro-Grant Fund
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search funds by name, donor, or university campus..."
                value={filters.search}
                onChange={(e) => applyFilterChanges({ search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <Filter className="w-4 h-4 text-cyan-400" />
              <select
                value={filters.fundCategory}
                onChange={(e) => applyFilterChanges({ fundCategory: e.target.value })}
                className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-semibold focus:outline-none focus:border-amber-500/50"
              >
                <option value="All">All Categories</option>
                <option value="RESEARCH_GRANT">Research Grants</option>
                <option value="STUDENT_SCHOLARSHIP">Scholarships</option>
                <option value="HACKATHON_SPONSORSHIP">Hackathon Sponsorships</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-extrabold text-2xl text-white flex items-center gap-2 tracking-tight">
            <GraduationCap className="w-6 h-6 text-amber-400" />
            Active Alumni Endowment Funds ({funds.length})
          </h2>

          {funds.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg">No active alumni funds found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {funds.map((item) => (
                <CampusAlumniEndowmentCard
                  key={item._id}
                  fund={item}
                  onDonateClick={handleDonate}
                />
              ))}
            </div>
          )}
        </div>

        <CampusAlumniEndowmentTimeline funds={funds} />

        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-black text-white">Launch Alumni Micro-Grant Fund</h3>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Fund Name</label>
                    <input type="text" required value={newFundName} onChange={(e) => setNewFundName(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Campus</label>
                    <input type="text" required value={newCampus} onChange={(e) => setNewCampus(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Alumni Donor</label>
                    <input type="text" required value={newDonor} onChange={(e) => setNewDonor(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Batch Year</label>
                    <input type="number" required value={newBatch} onChange={(e) => setNewBatch(parseInt(e.target.value))} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg">
                  Submit Fund Proposal
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { StudentVentureEngine } from '../services/studentVentureEngine';
import {
  fetchStudentVentures,
  registerStudentVenture,
  commitStudentVentureInvestment,
} from '../services/apiClient';
import { CampusStudentVentureCard } from '../components/venture/CampusStudentVentureCard';
import { CampusStudentVentureTimeline } from '../components/venture/CampusStudentVentureTimeline';
import {
  Rocket,
  Search,
  Filter,
  PlusCircle,
  ShieldCheck,
  Activity,
  X,
  DollarSign,
} from 'lucide-react';

export default function CampusStudentVentureStudioPage() {
  const [ventures, setVentures] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    campusName: 'All',
    sectorDomain: 'All',
    fundingStage: 'All',
    search: '',
  });

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('HyperLoop Robotics');
  const [newCampus, setNewCampus] = useState<string>('IIT Madras');
  const [newFounder, setNewFounder] = useState<string>('Karthik Raja');
  const [newSector, setNewSector] = useState<'FINTECH' | 'HEALTH_TECH' | 'ED_TECH' | 'SAAS' | 'HARDWARE'>('HARDWARE');
  const [newStage, setNewStage] = useState<'PRE_SEED' | 'SEED' | 'SERIES_A' | 'STUDENT_GRANT'>('PRE_SEED');
  const [newTarget, setNewTarget] = useState<string>('50000');
  const [newSummary, setNewSummary] = useState<string>('Building autonomous warehouse inspection drones for logistics hubs in emerging markets.');

  useEffect(() => {
    loadVentures();
  }, []);

  const loadVentures = async () => {
    try {
      const data = await fetchStudentVentures(filters);
      if (data && data.length > 0) {
        setVentures(data);
        return;
      }
    } catch (err) {
      console.warn('API fetchStudentVentures failed, using engine fallback', err);
    }
    const fallback = await StudentVentureEngine.getVentures(filters);
    setVentures(fallback);
  };

  const applyFilterChanges = async (updated: any) => {
    const next = { ...filters, ...updated };
    setFilters(next);
    try {
      const data = await fetchStudentVentures(next);
      if (data && data.length > 0) {
        setVentures(data);
        return;
      }
    } catch (err) {
      console.warn('API fetchStudentVentures failed, using engine fallback', err);
    }
    const fallback = await StudentVentureEngine.getVentures(next);
    setVentures(fallback);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTarget);

    if (!Number.isFinite(target)) {
      alert('Please enter a valid target investment.');
      return;
    }

    const payload = {
      startupName: newName,
      campusName: newCampus,
      studentFounderName: newFounder,
      sectorDomain: newSector,
      fundingStage: newStage,
      targetInvestmentUsd: target,
      executiveSummary: newSummary,
    };

    try {
      await registerStudentVenture(payload);
    } catch (err) {
      console.warn('API registerStudentVenture failed, registering locally', err);
      await StudentVentureEngine.registerVenture(payload);
    }
    await loadVentures();
    setShowCreateModal(false);
  };

  const handleInvest = async (id: string) => {
    try {
      await commitStudentVentureInvestment(id, 5000);
    } catch (err) {
      console.warn('API commitStudentVentureInvestment failed, committing locally', err);
      await StudentVentureEngine.commitInvestment(id, 5000);
    }
    await loadVentures();
  };

  return (
    <div className="min-h-screen  py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-400">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Enterprise Campus Student Venture Capital & Accelerator Suite
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Campus Student Venture Studio
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Connect campus student-led startups with university venture capital funds, angel networks, and micro-grant accelerators.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 text-sm"
              >
                <PlusCircle className="w-5 h-5 fill-current" />
                Submit Student Startup Pitch
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
                placeholder="Search startups by name, student founder, or university campus..."
                value={filters.search}
                onChange={(e) => applyFilterChanges({ search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <Filter className="w-4 h-4 text-cyan-400" />
              <select
                value={filters.sectorDomain}
                onChange={(e) => applyFilterChanges({ sectorDomain: e.target.value })}
                className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-semibold focus:outline-none focus:border-emerald-500/50"
              >
                <option value="All">All Sectors</option>
                <option value="HARDWARE">Hardware & Robotics</option>
                <option value="SAAS">Enterprise SaaS</option>
                <option value="FINTECH">FinTech</option>
                <option value="HEALTH_TECH">HealthTech</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-extrabold text-2xl text-white flex items-center gap-2 tracking-tight">
            <Rocket className="w-6 h-6 text-emerald-400" />
            Active Student-Led Startups ({ventures.length})
          </h2>

          {ventures.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg">No student startups registered</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ventures.map((item) => (
                <CampusStudentVentureCard
                  key={item._id}
                  venture={item}
                  onInvestClick={handleInvest}
                />
              ))}
            </div>
          )}
        </div>

        <CampusStudentVentureTimeline ventures={ventures} />

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
                <h3 className="text-2xl font-black text-white">Submit Student Startup Pitch</h3>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Startup Name</label>
                    <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Founder Name</label>
                    <input type="text" required value={newFounder} onChange={(e) => setNewFounder(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Campus</label>
                    <input type="text" required value={newCampus} onChange={(e) => setNewCampus(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Target ($)</label>
                    <input type="number" required value={newTarget} onChange={(e) => setNewTarget(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg">
                  Submit Pitch Node
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ResearchPatentEngine } from '../services/researchPatentEngine';
import {
  fetchResearchPatents,
  registerResearchPatent,
  executePatentLicensingAgreement,
} from '../services/apiClient';
import { CampusResearchPatentCard } from '../components/patents/CampusResearchPatentCard';
import { CampusResearchPatentTimeline } from '../components/patents/CampusResearchPatentTimeline';
import {
  Cpu,
  Search,
  Filter,
  PlusCircle,
  ShieldCheck,
  Activity,
  X,
  FileCheck,
} from 'lucide-react';

export default function CampusResearchIpLicensingStudioPage() {
  const [patents, setPatents] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    campusName: 'All',
    technologyDomain: 'All',
    patentStatus: 'All',
    search: '',
  });

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('Neuromorphic Silicon Microprocessor Architecture');
  const [newCampus, setNewCampus] = useState<string>('IISc Bangalore');
  const [newInventor, setNewInventor] = useState<string>('Dr. Vikram Sarabhai');
  const [newAppNum, setNewAppNum] = useState<string>('PAT-2026-IN-9941');
  const [newDomain, setNewDomain] = useState<'ARTIFICIAL_INTELLIGENCE' | 'BIOTECH' | 'CLEANTECH' | 'QUANTUM' | 'SEMICONDUCTORS'>('SEMICONDUCTORS');
  const [newFee, setNewFee] = useState<string>('50000');
  const [newRoyalty, setNewRoyalty] = useState<string>('4.5');
  const [newAbstract, setNewAbstract] = useState<string>('Ultra-low power neuromorphic microchips optimized for edge AI inference with on-chip spike learning.');

  useEffect(() => {
    loadPatents();
  }, []);

  const loadPatents = async () => {
    try {
      const data = await fetchResearchPatents(filters);
      if (data && data.length > 0) {
        setPatents(data);
        return;
      }
    } catch (err) {
      console.warn('API fetchResearchPatents failed, using engine fallback', err);
    }
    const fallback = await ResearchPatentEngine.getPatents(filters);
    setPatents(fallback);
  };

  const applyFilterChanges = async (updated: any) => {
    const next = { ...filters, ...updated };
    setFilters(next);
    try {
      const data = await fetchResearchPatents(next);
      if (data && data.length > 0) {
        setPatents(data);
        return;
      }
    } catch (err) {
      console.warn('API fetchResearchPatents failed, using engine fallback', err);
    }
    const fallback = await ResearchPatentEngine.getPatents(next);
    setPatents(fallback);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = parseFloat(newFee);
    const roy = parseFloat(newRoyalty);

    if (!Number.isFinite(fee) || !Number.isFinite(roy)) {
      alert('Please enter valid numerical values.');
      return;
    }

    const payload = {
      patentTitle: newTitle,
      campusName: newCampus,
      leadInventorName: newInventor,
      patentApplicationNumber: newAppNum,
      technologyDomain: newDomain,
      licensingFeeUsd: fee,
      royaltySharePercent: roy,
      abstractDescription: newAbstract,
    };

    try {
      await registerResearchPatent(payload);
    } catch (err) {
      console.warn('API registerResearchPatent failed, registering locally', err);
      await ResearchPatentEngine.registerPatent(payload);
    }
    await loadPatents();
    setShowCreateModal(false);
  };

  const handleLicense = async (id: string) => {
    try {
      await executePatentLicensingAgreement(id, 'Intel Capital Technologies');
    } catch (err) {
      console.warn('API executePatentLicensingAgreement failed, licensing locally', err);
      await ResearchPatentEngine.executeLicensingAgreement(id, 'Intel Capital Technologies');
    }
    await loadPatents();
  };

  return (
    <div className="min-h-screen  py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Enterprise Campus Research IP & Technology Licensing Studio
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Campus Research IP Studio
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Showcase student & faculty patent filings, facilitate enterprise technology transfer, and manage commercial royalty distribution.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 text-sm"
              >
                <PlusCircle className="w-5 h-5 fill-current" />
                Register Campus Patent IP
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
                placeholder="Search by patent title, inventor, or application number..."
                value={filters.search}
                onChange={(e) => applyFilterChanges({ search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filters.technologyDomain}
                onChange={(e) => applyFilterChanges({ technologyDomain: e.target.value })}
                className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-semibold focus:outline-none focus:border-cyan-500/50"
              >
                <option value="All">All Domains</option>
                <option value="ARTIFICIAL_INTELLIGENCE">Artificial Intelligence</option>
                <option value="SEMICONDUCTORS">Semiconductors</option>
                <option value="QUANTUM">Quantum Computing</option>
                <option value="BIOTECH">Biotechnology</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-extrabold text-2xl text-white flex items-center gap-2 tracking-tight">
            <Cpu className="w-6 h-6 text-cyan-400" />
            Registered Campus Patents ({patents.length})
          </h2>

          {patents.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg">No patents registered</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patents.map((item) => (
                <CampusResearchPatentCard
                  key={item._id}
                  patent={item}
                  onLicenseClick={handleLicense}
                />
              ))}
            </div>
          )}
        </div>

        <CampusResearchPatentTimeline patents={patents} />

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
                <h3 className="text-2xl font-black text-white">Register Campus Patent IP</h3>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Patent Title</label>
                    <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">App Number</label>
                    <input type="text" required value={newAppNum} onChange={(e) => setNewAppNum(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Campus</label>
                    <input type="text" required value={newCampus} onChange={(e) => setNewCampus(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Lead Inventor</label>
                    <input type="text" required value={newInventor} onChange={(e) => setNewInventor(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg">
                  Submit Patent IP
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

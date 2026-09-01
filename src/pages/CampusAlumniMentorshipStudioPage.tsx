import React, { useState, useEffect } from 'react';
import { AlumniMentorshipEngine } from '../services/alumniMentorshipEngine';
import {
  fetchAlumniMentorshipSlots,
  registerAlumniMentorshipSlot,
  bookAlumniMentorshipSession,
} from '../services/apiClient';
import { CampusAlumniMentorshipCard } from '../components/mentorship/CampusAlumniMentorshipCard';
import { CampusAlumniMentorshipTimeline } from '../components/mentorship/CampusAlumniMentorshipTimeline';
import {
  GraduationCap,
  Search,
  Filter,
  PlusCircle,
  ShieldCheck,
  Activity,
  X,
  UserCheck,
} from 'lucide-react';

export default function CampusAlumniMentorshipStudioPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    campusName: 'All',
    expertiseArea: 'All',
    status: 'All',
    search: '',
  });

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newMentor, setNewMentor] = useState<string>('Priya Nambiar');
  const [newBatch, setNewBatch] = useState<number>(2018);
  const [newCompany, setNewCompany] = useState<string>('Google DeepMind');
  const [newRole, setNewRole] = useState<string>('Staff AI Research Scientist');
  const [newCampus, setNewCampus] = useState<string>('BITS Pilani');
  const [newArea, setNewArea] = useState<'SOFTWARE_ENGINEERING' | 'PRODUCT_MANAGEMENT' | 'AI_RESEARCH' | 'VENTURE_CAPITAL'>('AI_RESEARCH');
  const [newTopics, setNewTopics] = useState<string>('Break in AI Research & ML Engineering, publishing at NeurIPS, and career scaling.');

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    try {
      const data = await fetchAlumniMentorshipSlots(filters);
      if (data && data.length > 0) {
        setSlots(data);
        return;
      }
    } catch (err) {
      console.warn('API fetchAlumniMentorshipSlots failed, using engine fallback', err);
    }
    const fallback = await AlumniMentorshipEngine.getSlots(filters);
    setSlots(fallback);
  };

  const applyFilterChanges = async (updated: any) => {
    const next = { ...filters, ...updated };
    setFilters(next);
    try {
      const data = await fetchAlumniMentorshipSlots(next);
      if (data && data.length > 0) {
        setSlots(data);
        return;
      }
    } catch (err) {
      console.warn('API fetchAlumniMentorshipSlots failed, using engine fallback', err);
    }
    const fallback = await AlumniMentorshipEngine.getSlots(next);
    setSlots(fallback);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      mentorName: newMentor,
      mentorAlumniBatchYear: newBatch,
      mentorCurrentCompany: newCompany,
      mentorCurrentRole: newRole,
      campusName: newCampus,
      expertiseArea: newArea,
      availableSessionsCount: 3,
      sessionTopics: newTopics,
    };
    try {
      await registerAlumniMentorshipSlot(payload);
    } catch (err) {
      console.warn('API registerAlumniMentorshipSlot failed, registering locally', err);
      await AlumniMentorshipEngine.registerSlot(payload);
    }
    await loadSlots();
    setShowCreateModal(false);
  };

  const handleBook = async (id: string) => {
    try {
      await bookAlumniMentorshipSession(id, 'STU-9920', 'Rohan Mehta');
    } catch (err) {
      console.warn('API bookAlumniMentorshipSession failed, booking locally', err);
      await AlumniMentorshipEngine.bookSession(id, 'STU-9920', 'Rohan Mehta');
    }
    await loadSlots();
  };

  return (
    <div className="min-h-screen  py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Enterprise Campus Alumni Mentorship & Advisory Matching Suite
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Campus Alumni Mentorship Studio
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Connect campus students with distinguished alumni working at tier-1 tech & venture firms for 1:1 career guidance and mock interviews.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 text-sm"
              >
                <PlusCircle className="w-5 h-5 fill-current" />
                Open Alumni Advisory Slot
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
                placeholder="Search mentors by name, company, or advisory topics..."
                value={filters.search}
                onChange={(e) => applyFilterChanges({ search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filters.expertiseArea}
                onChange={(e) => applyFilterChanges({ expertiseArea: e.target.value })}
                className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-semibold focus:outline-none focus:border-indigo-500/50"
              >
                <option value="All">All Expertise</option>
                <option value="SOFTWARE_ENGINEERING">Software Engineering</option>
                <option value="AI_RESEARCH">AI Research</option>
                <option value="PRODUCT_MANAGEMENT">Product Management</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-extrabold text-2xl text-white flex items-center gap-2 tracking-tight">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            Active Alumni Advisory Slots ({slots.length})
          </h2>

          {slots.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg">No mentorship slots available</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {slots.map((item) => (
                <CampusAlumniMentorshipCard
                  key={item._id}
                  slot={item}
                  onBookClick={handleBook}
                />
              ))}
            </div>
          )}
        </div>

        <CampusAlumniMentorshipTimeline slots={slots} />

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
                <h3 className="text-2xl font-black text-white">Open Alumni Advisory Slot</h3>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Mentor Name</label>
                    <input type="text" required value={newMentor} onChange={(e) => setNewMentor(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Company</label>
                    <input type="text" required value={newCompany} onChange={(e) => setNewCompany(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Role</label>
                    <input type="text" required value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Batch Year</label>
                    <input type="number" required value={newBatch} onChange={(e) => setNewBatch(parseInt(e.target.value))} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg">
                  Submit Mentorship Slot
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

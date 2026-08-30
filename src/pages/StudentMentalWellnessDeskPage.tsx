import React, { useState, useEffect } from 'react';
import { StudentMentalWellnessEngine } from '../services/mentalWellnessEngine';
import {
  fetchMentalWellnessCheckIns,
  createMentalWellnessCheckIn,
  assignCounselorCheckIn,
} from '../services/apiClient';
import { StudentMentalWellnessCard } from '../components/wellness/StudentMentalWellnessCard';
import { StudentMentalWellnessTimeline } from '../components/wellness/StudentMentalWellnessTimeline';
import {
  HeartPulse,
  Search,
  Filter,
  PlusCircle,
  ShieldCheck,
  Activity,
  X,
  UserCheck,
} from 'lucide-react';

export default function StudentMentalWellnessDeskPage() {
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    campusName: 'All',
    stressLevel: 'All',
    sessionStatus: 'All',
    search: '',
  });

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newStudentId, setNewStudentId] = useState<string>('STU-8821');
  const [newStudentName, setNewStudentName] = useState<string>('Aarav Sharma');
  const [newCampus, setNewCampus] = useState<string>('IIT Delhi');
  const [newMood, setNewMood] = useState<number>(2);
  const [newStress, setNewStress] = useState<'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [newStressor, setNewStressor] = useState<'ACADEMICS' | 'EXAMS' | 'JOB_HUNT' | 'FINANCES' | 'PERSONAL'>('EXAMS');
  const [newSupport, setNewSupport] = useState<boolean>(true);

  useEffect(() => {
    loadCheckIns();
  }, []);

  const loadCheckIns = async () => {
    try {
      const data = await fetchMentalWellnessCheckIns(filters);
      if (data && data.length > 0) {
        setCheckIns(data);
        return;
      }
    } catch (err) {
      console.warn('API fetchMentalWellnessCheckIns failed, using engine fallback', err);
    }
    const fallback = await StudentMentalWellnessEngine.getCheckIns(filters);
    setCheckIns(fallback);
  };

  const applyFilterChanges = async (updated: any) => {
    const next = { ...filters, ...updated };
    setFilters(next);
    try {
      const data = await fetchMentalWellnessCheckIns(next);
      if (data && data.length > 0) {
        setCheckIns(data);
        return;
      }
    } catch (err) {
      console.warn('API fetchMentalWellnessCheckIns failed, using engine fallback', err);
    }
    const fallback = await StudentMentalWellnessEngine.getCheckIns(next);
    setCheckIns(fallback);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      studentId: newStudentId,
      studentName: newStudentName,
      campusName: newCampus,
      moodRating: newMood,
      stressLevel: newStress,
      primaryStressor: newStressor,
      supportRequested: newSupport,
    };

    try {
      await createMentalWellnessCheckIn(payload);
    } catch (err) {
      console.warn('API createMentalWellnessCheckIn failed, creating locally', err);
      await StudentMentalWellnessEngine.createCheckIn(payload);
    }
    await loadCheckIns();
    setShowCreateModal(false);
  };

  const handleAssignCounselor = async (id: string) => {
    try {
      await assignCounselorCheckIn(id, 'Dr. Ananya Verma (Clinical Psychologist)');
    } catch (err) {
      console.warn('API assignCounselorCheckIn failed, assigning locally', err);
      await StudentMentalWellnessEngine.assignCounselor(id, 'Dr. Ananya Verma (Clinical Psychologist)');
    }
    await loadCheckIns();
  };

  return (
    <div className="min-h-screen  py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-teal-300">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Enterprise Student Mental Wellness & Counseling Desk Suite
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Student Mental Wellness Desk
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Confidential campus mental health telemetry, burnout score analytics, and tele-counseling counselor dispatch for university students.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 text-sm"
              >
                <PlusCircle className="w-5 h-5 fill-current" />
                Log Confidential Wellness Check-In
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
                placeholder="Search check-ins by student name or student ID..."
                value={filters.search}
                onChange={(e) => applyFilterChanges({ search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filters.stressLevel}
                onChange={(e) => applyFilterChanges({ stressLevel: e.target.value })}
                className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm font-semibold focus:outline-none focus:border-teal-500/50"
              >
                <option value="All">All Stress Levels</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MODERATE">MODERATE</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-extrabold text-2xl text-white flex items-center gap-2 tracking-tight">
            <HeartPulse className="w-6 h-6 text-teal-400" />
            Monitored Wellness Check-Ins ({checkIns.length})
          </h2>

          {checkIns.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg">No wellness check-ins recorded</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {checkIns.map((item) => (
                <StudentMentalWellnessCard
                  key={item._id}
                  checkIn={item}
                  onAssignCounselorClick={handleAssignCounselor}
                />
              ))}
            </div>
          )}
        </div>

        <StudentMentalWellnessTimeline checkIns={checkIns} />

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
                <h3 className="text-2xl font-black text-white">Log Confidential Wellness Check-In</h3>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Student Name</label>
                    <input type="text" required value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Student ID</label>
                    <input type="text" required value={newStudentId} onChange={(e) => setNewStudentId(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Campus</label>
                    <input type="text" required value={newCampus} onChange={(e) => setNewCampus(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Mood Rating (1-5)</label>
                    <input type="number" min="1" max="5" required value={newMood} onChange={(e) => setNewMood(parseInt(e.target.value))} className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm" />
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg">
                  Submit Check-In
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

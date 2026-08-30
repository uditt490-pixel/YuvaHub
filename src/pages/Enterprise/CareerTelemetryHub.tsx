import React, { useState, useEffect } from 'react';
import {
  StudentTelemetryRecord,
  CareerTelemetryAnalytics,
  CareerTelemetryFilter,
  CareerInterventionPayload,
  MockInterviewLog
} from '../../types/careerTelemetry';
import { CareerTelemetryService } from '../../services/CareerTelemetryService';
import { CareerTelemetryCard } from '../../components/Enterprise/CareerTelemetryCard';
import { CareerTelemetryFilterToolbar } from '../../components/Enterprise/CareerTelemetryFilterToolbar';
import { StudentTelemetryModal } from '../../components/Enterprise/StudentTelemetryModal';
import { CareerInterventionModal } from '../../components/Enterprise/CareerInterventionModal';
import {
  Activity,
  LayoutGrid,
  List,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Flame,
  ShieldCheck,
  Award,
  AlertTriangle
} from 'lucide-react';

export const CareerTelemetryHub: React.FC = () => {
  const [students, setStudents] = useState<StudentTelemetryRecord[]>([]);
  const [analytics, setAnalytics] = useState<CareerTelemetryAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'grid' | 'table' | 'protocols'>('grid');

  // Filters
  const [filters, setFilters] = useState<CareerTelemetryFilter>({
    searchQuery: '',
    domain: 'ALL',
    riskStatus: 'ALL',
    institution: '',
    minEmployabilityIndex: 0,
    sortBy: 'employabilityIndex',
    sortOrder: 'desc'
  });

  // Modal selections
  const [selectedStudent, setSelectedStudent] = useState<StudentTelemetryRecord | null>(null);
  const [interventionTarget, setInterventionTarget] = useState<StudentTelemetryRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [list, stats] = await Promise.all([
        CareerTelemetryService.getStudentTelemetry(filters),
        CareerTelemetryService.getAnalytics()
      ]);
      setStudents(list);
      setAnalytics(stats);
    } catch (err) {
      showToast('Failed to load telemetry data', 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleInterventionConfirm = async (payload: CareerInterventionPayload) => {
    try {
      const updated = await CareerTelemetryService.executeCareerIntervention(payload);
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      if (selectedStudent && selectedStudent.id === updated.id) {
        setSelectedStudent(updated);
      }
      setInterventionTarget(null);
      showToast(`⚡ Intervention protocol authorized for ${updated.fullName}`, 'success');
      const stats = await CareerTelemetryService.getAnalytics();
      setAnalytics(stats);
    } catch (err: any) {
      showToast(err.message || 'Intervention launch failed', 'warn');
    }
  };

  const handleAddMockInterview = async (studentId: string, interview: Omit<MockInterviewLog, 'id' | 'date'>) => {
    try {
      const updated = await CareerTelemetryService.addMockInterview(studentId, interview);
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      if (selectedStudent && selectedStudent.id === updated.id) {
        setSelectedStudent(updated);
      }
      showToast('Mock assessment recorded and Employability Index recalculated');
      const stats = await CareerTelemetryService.getAnalytics();
      setAnalytics(stats);
    } catch (err: any) {
      showToast('Failed to log mock interview', 'warn');
    }
  };

  const handleExportCsv = () => {
    const csv = CareerTelemetryService.exportCSV(students);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `YuvaHub_Career_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Career Telemetry CSV');
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      domain: 'ALL',
      riskStatus: 'ALL',
      institution: '',
      minEmployabilityIndex: 0,
      sortBy: 'employabilityIndex',
      sortOrder: 'desc'
    });
  };

  const getRiskBadgeColor = (risk: StudentTelemetryRecord['riskStatus']) => {
    switch (risk) {
      case 'OPTIMAL':
        return 'bg-emerald-500/200/20 text-emerald-800 border-emerald-500/30 dark:bg-emerald-950 dark:text-emerald-300';
      case 'ON_TRACK':
        return 'bg-blue-500/200/20 text-blue-800 border-blue-500/30 dark:bg-blue-950 dark:text-blue-300';
      case 'AT_RISK':
        return 'bg-amber-500/200/20 text-amber-800 border-amber-500/30 dark:bg-amber-950 dark:text-amber-300';
      case 'CRITICAL_INTERVENTION':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300';
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950 text-text-primary dark:text-slate-100 p-4 sm:p-6 lg:p-10 font-sans space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 bg-primary-blue text-white dark:bg-surface dark:text-text-primary border border-border-theme animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface dark:bg-primary-blue p-6 rounded-3xl border border-border-theme dark:border-border-theme shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 dark:bg-indigo-950 text-indigo-400 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-indigo-500/30 dark:border-indigo-900">
              <Activity className="w-3.5 h-3.5" /> Career Telemetry & Mentorship
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-secondary dark:bg-surface-secondary text-text-secondary dark:text-slate-300 text-[10px] font-mono font-bold">
              AICTE / NAAC Standard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white tracking-tight">
            Student Career Telemetry & AI Mentorship Command Station
          </h1>
          <p className="text-xs sm:text-sm text-text-muted dark:text-text-muted mt-1">
            Real-time employability telemetry, mock interview simulations, and emergency acceleration protocols.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-surface-secondary dark:bg-surface-secondary p-1.5 rounded-2xl border border-border-theme dark:border-border-theme">
          <button
            onClick={() => setActiveView('grid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'grid'
                ? 'bg-surface dark:bg-primary-blue text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Telemetry Cards
          </button>
          <button
            onClick={() => setActiveView('table')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'table'
                ? 'bg-surface dark:bg-primary-blue text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <List className="w-4 h-4" /> Cohort Roster
          </button>
          <button
            onClick={() => setActiveView('protocols')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'protocols'
                ? 'bg-surface dark:bg-primary-blue text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" /> Active Protocols
          </button>
        </div>
      </div>

      {/* Analytics KPI Block */}
      {analytics && <CareerTelemetryCard analytics={analytics} />}

      {/* Filter Toolbar */}
      <CareerTelemetryFilterToolbar
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        onExportCsv={handleExportCsv}
        totalMatches={students.length}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Streaming Real-Time Academic Telemetry...
          </p>
        </div>
      ) : activeView === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className="p-5 rounded-3xl bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme shadow-sm hover:shadow-md hover:border-blue-500 transition-all cursor-pointer space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={student.avatarUrl}
                    alt={student.fullName}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-border-theme dark:border-border-theme shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-text-primary dark:text-white">
                      {student.fullName}
                    </h3>
                    <div className="text-xs text-text-muted flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                      {student.institution}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${getRiskBadgeColor(student.riskStatus)}`}>
                  {student.riskStatus.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="text-xs font-semibold text-text-primary dark:text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                {student.targetDomain.replace(/_/g, ' ')}
              </div>

              {/* Meter */}
              <div className="p-3 rounded-2xl bg-surface dark:bg-surface-secondary/60 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-text-muted">Employability Index</span>
                  <span className="text-blue-400 dark:text-blue-400">
                    {student.employabilityIndex}%
                  </span>
                </div>
                <div className="w-full bg-border-theme dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full"
                    style={{ width: `${student.employabilityIndex}%` }}
                  />
                </div>
              </div>

              {/* Telemetry Chips */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/40">
                  <div className="text-[10px] text-text-muted font-bold uppercase">Study Hours</div>
                  <div className="font-bold text-text-primary dark:text-slate-200 mt-0.5">
                    {student.weeklyStudyHours} hrs/wk
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/40">
                  <div className="text-[10px] text-text-muted font-bold uppercase">Active Streak</div>
                  <div className="font-bold text-amber-500 mt-0.5 flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> {student.streakDays} Days
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-border-theme dark:border-border-theme flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setInterventionTarget(student);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 dark:bg-amber-950 text-amber-400 dark:text-amber-400 font-bold text-xs flex items-center gap-1 hover:bg-amber-500/200/20 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" /> Intervention
                </button>
                <span className="text-xs font-bold text-blue-400 dark:text-blue-400 flex items-center gap-0.5">
                  Inspect <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : activeView === 'table' ? (
        /* Table View */
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface dark:bg-surface-secondary/80 border-b border-border-theme dark:border-border-theme text-text-muted dark:text-text-muted font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Student & Campus</th>
                  <th className="p-4">Target Domain</th>
                  <th className="p-4">Employability</th>
                  <th className="p-4">ATS Match</th>
                  <th className="p-4">Weekly Load</th>
                  <th className="p-4">Risk Status</th>
                  <th className="p-4">Assigned Mentor</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-surface dark:hover:bg-surface-secondary/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatarUrl}
                          alt={student.fullName}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <div className="font-bold text-text-primary dark:text-white">{student.fullName}</div>
                          <div className="text-[11px] text-text-muted">{student.institution}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-text-primary dark:text-slate-200">
                      {student.targetDomain.replace(/_/g, ' ')}
                    </td>
                    <td className="p-4 font-bold text-blue-400 dark:text-blue-400">
                      {student.employabilityIndex}%
                    </td>
                    <td className="p-4 font-semibold text-emerald-400">
                      {student.atsReadinessScore}%
                    </td>
                    <td className="p-4 font-mono font-bold">
                      {student.weeklyStudyHours} hrs
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadgeColor(student.riskStatus)}`}>
                        {student.riskStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-text-secondary dark:text-text-muted">
                      {student.mentorAssigned || 'None'}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="px-3 py-1 rounded-lg bg-blue-500/20 dark:bg-blue-950 text-blue-400 dark:text-blue-400 font-bold hover:bg-blue-500/200/20"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => setInterventionTarget(student)}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 dark:bg-amber-950 text-amber-400 dark:text-amber-400 font-bold hover:bg-amber-500/200/20"
                      >
                        Intervene
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Protocols View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Career Acceleration Protocol Framework
            </h3>
            <p className="text-xs text-text-muted dark:text-text-muted leading-relaxed">
              When a student's weekly study volume or mock interview confidence dips below institutional baseline thresholds, automated high-assurance intervention gates pair the student with Tier-1 industry mentors.
            </p>
            <div className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary/60 border border-border-theme dark:border-border-theme space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span>Protocol Trigger Threshold</span>
                <span className="text-rose-600">&lt; 70% Employability Index</span>
              </div>
              <div className="flex justify-between">
                <span>Mentor Assignment SLA</span>
                <span className="text-blue-400">&lt; 24 Hours</span>
              </div>
              <div className="flex justify-between">
                <span>Average Score Recovery</span>
                <span className="text-emerald-400">+22.4% over 30 days</span>
              </div>
            </div>
          </div>

          <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Audit Integrity & Accreditation
            </h3>
            <p className="text-xs text-text-muted dark:text-text-muted leading-relaxed">
              Every mock interview score, mentor critique, and study telemetry packet is signed and retained for institutional accreditation reporting (NAAC Criterion 5 / NBA Criteria).
            </p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-900">
                <div className="text-xl font-black text-emerald-400 dark:text-emerald-400">91.4%</div>
                <div className="text-[10px] text-text-muted">Passing Rate</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-500/20 dark:bg-blue-950/40 border border-blue-500/30 dark:border-blue-900">
                <div className="text-xl font-black text-blue-400 dark:text-blue-400">100%</div>
                <div className="text-[10px] text-text-muted">Immutable Logs</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Inspector */}
      {selectedStudent && (
        <StudentTelemetryModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onIntervene={(stu) => {
            setSelectedStudent(null);
            setInterventionTarget(stu);
          }}
          onAddMockInterview={handleAddMockInterview}
        />
      )}

      {/* Intervention Modal */}
      {interventionTarget && (
        <CareerInterventionModal
          student={interventionTarget}
          onClose={() => setInterventionTarget(null)}
          onConfirm={handleInterventionConfirm}
        />
      )}
    </div>
  );
};

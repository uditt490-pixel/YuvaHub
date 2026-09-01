import React, { useState } from 'react';
import { Award, CheckCircle2, AlertCircle, Loader2, Sparkles, Filter } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function ScholarshipScreener() {
  const { user, profile } = useAppContext();
  
  // Form State
  const [familyIncome, setFamilyIncome] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [gender, setGender] = useState('All');
  const [year, setYear] = useState('1');
  const [category, setCategory] = useState('General');

  // Results State
  const [loading, setLoading] = useState(false);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyIncome || !cgpa) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/scholarships/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyIncome: Number(familyIncome),
          cgpa: Number(cgpa),
          gender,
          year: Number(year),
          category
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch matches');

      setScholarships(data.scholarships || []);
      setHasSearched(true);
    } catch (err: any) {
      setError(err.message || 'Error running eligibility screener');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">
      {/* Header */}
      <div className="bg-surface dark:bg-slate-900 p-6 rounded-3xl border border-border-theme dark:border-slate-800 shadow-2xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#603620] text-[#f3e4bd] text-xs font-bold uppercase tracking-wider mb-2">
          <Award className="w-3.5 h-3.5 text-[#f3e4bd]" />
          <span>AI Eligibility Pre-Screener</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-text-primary dark:text-white tracking-tight">
          Scholarship <span className="text-primary-blue italic">Match Studio</span>
        </h1>
        <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">
          Input your academic and demographic details once to instantly filter through hundreds of scholarships and find your high-confidence matches.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form Questionnaire */}
        <div className="lg:col-span-1 bg-surface dark:bg-slate-900 p-6 rounded-3xl border border-border-theme dark:border-slate-800 shadow-2xs h-fit space-y-4">
          <h2 className="text-base font-serif font-bold text-text-primary dark:text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary-blue" />
            Your Profile Criteria
          </h2>

          <form onSubmit={handleScreening} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-text-secondary dark:text-slate-300 mb-1">Annual Family Income (₹)</label>
              <input 
                type="number"
                value={familyIncome}
                onChange={(e) => setFamilyIncome(e.target.value)}
                placeholder="e.g. 500000"
                required
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-text-primary dark:text-white outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-text-secondary dark:text-slate-300 mb-1">Current CGPA</label>
              <input 
                type="number"
                step="0.01"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="e.g. 8.5"
                required
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-text-primary dark:text-white outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-text-secondary dark:text-slate-300 mb-1">Academic Year</label>
              <select 
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-text-primary dark:text-white outline-none font-bold"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-text-secondary dark:text-slate-300 mb-1">Gender</label>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-text-primary dark:text-white outline-none font-bold"
              >
                <option value="All">All</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-3.5 h-3.5" /> Run Eligibility Check</>}
            </button>
          </form>
        </div>

        {/* Right Results Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-serif font-bold text-text-primary dark:text-white">
            Matching Scholarships {hasSearched && `(${scholarships.length} Found)`}
          </h2>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              {error}
            </div>
          )}

          {!hasSearched ? (
            <div className="p-12 text-center bg-surface dark:bg-slate-900 rounded-3xl border border-border-theme dark:border-slate-800 space-y-3">
              <Sparkles className="w-10 h-10 text-primary-blue mx-auto" />
              <h3 className="font-bold text-sm text-text-primary dark:text-white">Run your screener to view eligible grants</h3>
              <p className="text-xs text-text-secondary dark:text-slate-400 max-w-sm mx-auto font-medium">Complete your profile criteria on the left to evaluate your acceptance odds instantly.</p>
            </div>
          ) : scholarships.length === 0 ? (
            <div className="p-12 text-center bg-surface dark:bg-slate-900 rounded-3xl border border-border-theme dark:border-slate-800 space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-bold text-sm text-text-primary dark:text-white">No strict matches found</h3>
              <p className="text-xs text-text-secondary dark:text-slate-400 max-w-sm mx-auto font-medium">Try broadening your income or CGPA parameters to see more listings.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scholarships.map((s) => (
                <div key={s._id} className="bg-surface dark:bg-slate-900 p-6 rounded-3xl border border-border-theme dark:border-slate-800 shadow-2xs space-y-3 hover:border-primary-blue transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{s.provider}</span>
                      <h3 className="text-base font-serif font-bold text-text-primary dark:text-white">{s.title}</h3>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black rounded-full border border-emerald-200">
                      {s.matchConfidence}% Match
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary dark:text-slate-300 font-medium leading-relaxed">{s.description}</p>

                  <div className="flex justify-between items-center pt-3 border-t border-border-theme dark:border-slate-800 text-xs">
                    <span className="font-extrabold text-primary-blue text-sm">{s.amount}</span>
                    <span className="text-text-muted font-semibold">Deadline: {new Date(s.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

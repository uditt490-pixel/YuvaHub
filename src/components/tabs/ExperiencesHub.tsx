import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Clock, Building, ShieldAlert, Star } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function ExperiencesHub() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCompany, setSearchCompany] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAppContext();

  // Form State
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState(3);
  const [rounds, setRounds] = useState<string[]>([""]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const token = user ? await user.getIdToken() : '';
      const params = new URLSearchParams();
      if (searchCompany) params.append('company', searchCompany);
      if (searchRole) params.append('role', searchRole);

      const res = await fetch(`/api/v1/experiences?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setExperiences(data.experiences || []);
      }
    } catch (err) {
      console.error("Failed to fetch experiences", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [searchCompany, searchRole, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to post an experience");
    setSubmitting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/v1/experiences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          company,
          role,
          difficulty,
          rounds: rounds.filter(r => r.trim() !== ""),
          isAnonymous,
          userId: user.uid
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setCompany("");
        setRole("");
        setDifficulty(3);
        setRounds([""]);
        setIsAnonymous(false);
        fetchExperiences();
      } else {
        const errorData = await res.json();
        alert(`Failed to submit: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Error submitting experience", err);
    } finally {
      setSubmitting(false);
    }
  };

  const addRound = () => setRounds([...rounds, ""]);
  const updateRound = (index: number, val: string) => {
    const newRounds = [...rounds];
    newRounds[index] = val;
    setRounds(newRounds);
  };
  const removeRound = (index: number) => {
    const newRounds = rounds.filter((_, i) => i !== index);
    setRounds(newRounds);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-text-primary dark:text-white">Interview Experiences</h2>
          <p className="text-sm text-text-muted dark:text-gray-400 mt-1">Read and share real interview experiences from various companies.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-xl hover:bg-[#a05a2b] transition-colors font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Share Experience
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Company"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-theme dark:border-gray-700 bg-surface dark:bg-gray-800 text-sm focus:ring-2 focus:ring-[#b56b37] outline-none"
            value={searchCompany}
            onChange={(e) => setSearchCompany(e.target.value)}
          />
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Role"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-theme dark:border-gray-700 bg-surface dark:bg-gray-800 text-sm focus:ring-2 focus:ring-[#b56b37] outline-none"
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-text-muted dark:text-gray-400">Loading experiences...</div>
      ) : experiences.length === 0 ? (
        <div className="text-center py-12 bg-surface dark:bg-gray-800 rounded-2xl border border-border-theme dark:border-gray-700">
          <ShieldAlert className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No experiences found</h3>
          <p className="text-sm text-gray-500 mt-1">Be the first to share your interview experience!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp, idx) => (
            <div key={exp._id || idx} className="bg-surface dark:bg-gray-800 rounded-2xl p-5 border border-border-theme dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{exp.company}</h3>
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-1 rounded font-medium">
                  Diff: {exp.difficulty}/5
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{exp.role}</p>
              
              <div className="space-y-3 mb-4">
                {exp.rounds?.map((round: string, i: number) => (
                  <div key={i} className="text-sm">
                    <span className="font-semibold text-gray-900 dark:text-white block mb-1">Round {i + 1}:</span>
                    <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg text-xs leading-relaxed">{round}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {exp.isAnonymous ? "Anonymous" : "Verified User"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : "Recently"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Share Interview Experience</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white text-sm"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google, Amazon, Startup XYZ"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white text-sm"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Frontend Engineer, Product Manager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Overall Difficulty (1-5)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setDifficulty(num)}
                        className={`p-2 rounded-full transition-colors ${difficulty >= num ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interview Rounds</label>
                  <div className="space-y-2">
                    {rounds.map((round, i) => (
                      <div key={i} className="flex gap-2">
                        <textarea
                          required
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white text-sm resize-none"
                          rows={2}
                          value={round}
                          onChange={(e) => updateRound(i, e.target.value)}
                          placeholder={`Round ${i + 1} details (e.g., DSA on Leetcode medium, System Design...)`}
                        />
                        {rounds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRound(i)}
                            className="text-red-500 hover:text-red-700 p-2 h-fit rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            X
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addRound}
                    className="mt-2 text-sm text-primary-blue hover:underline font-medium"
                  >
                    + Add Another Round
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <input
                    type="checkbox"
                    id="isAnon"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-gray-300 text-primary-blue focus:ring-[#b56b37]"
                  />
                  <label htmlFor="isAnon" className="text-sm text-gray-700 dark:text-gray-300">
                    Post Anonymously (Hide my identity)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-blue rounded-lg hover:bg-[#a05a2b] transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Posting..." : "Post Experience"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle, Clock, Trash2, ChevronRight, Briefcase, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createCareerGoal, fetchCareerGoals, updateCareerGoalMilestone, deleteCareerGoal } from '../../services/apiClient';

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: string;
}

interface CareerGoal {
  _id: string;
  goalTitle: string;
  targetRole: string;
  targetDate: string;
  status: string;
  milestones: Milestone[];
}

const CareerGoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchCareerGoals();
      setGoals(data.goals || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !targetRole || !targetDate) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      await createCareerGoal(goalTitle, targetRole, targetDate);
      await loadGoals();
      setIsCreating(false);
      setGoalTitle('');
      setTargetRole('');
      setTargetDate('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate goal plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMilestone = async (goalId: string, milestoneId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
    
    // Optimistic update
    setGoals(prev => prev.map(g => {
      if (g._id === goalId) {
        return {
          ...g,
          milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, status: newStatus as any } : m)
        };
      }
      return g;
    }));

    try {
      await updateCareerGoalMilestone(goalId, milestoneId, newStatus);
    } catch (err) {
      console.error(err);
      // Revert on failure
      loadGoals();
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await deleteCareerGoal(goalId);
      setGoals(prev => prev.filter(g => g._id !== goalId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete goal');
    }
  };

  const calculateProgress = (milestones: Milestone[]) => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
  };

  if (loading && goals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Career Goal Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Define your objectives and let AI break them down into actionable milestones.
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Goal
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-xl">
          {error}
        </div>
      )}

      {isCreating && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New Goal</h2>
          <form onSubmit={handleCreateGoal} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What is your ultimate objective?
              </label>
              <input
                type="text"
                required
                value={goalTitle}
                onChange={e => setGoalTitle(e.target.value)}
                placeholder="e.g. Land a SDE-1 role at a FAANG"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-surface dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-surface dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-surface dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating AI Plan...
                  </>
                ) : (
                  'Generate Plan'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-8">
        {goals.map((goal) => (
          <div key={goal._id} className="bg-surface dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{goal.goalTitle}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {goal.targetRole}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteGoal(goal._id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  aria-label="Delete Goal"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Overall Progress</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{calculateProgress(goal.milestones)}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                    style={{ width: `${calculateProgress(goal.milestones)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Milestones</h3>
              
              <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4 space-y-8">
                {goal.milestones.map((milestone, idx) => {
                  const isCompleted = milestone.status === 'completed';
                  return (
                    <motion.div 
                      key={milestone.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative pl-8"
                    >
                      {/* Timeline Dot/Icon */}
                      <button 
                        onClick={() => toggleMilestone(goal._id, milestone.id, milestone.status)}
                        className="absolute -left-[21px] top-1 bg-surface dark:bg-gray-800 rounded-full p-1"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 bg-surface dark:bg-gray-800" />
                        ) : (
                          <Circle className="w-8 h-8 text-gray-300 dark:text-gray-600 hover:text-blue-500 transition-colors" />
                        )}
                      </button>

                      <div className={`p-5 rounded-xl border ${isCompleted ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30' : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className={`text-lg font-bold ${isCompleted ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                              {milestone.title}
                            </h4>
                            <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                              {milestone.description}
                            </p>
                          </div>
                          {milestone.dueDate && (
                            <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(milestone.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {!loading && goals.length === 0 && !isCreating && (
          <div className="text-center py-20 bg-surface dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 border-dashed">
            <Target className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No career goals set</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start by defining your ultimate career objective and let AI map out the milestones to get you there.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Create Your First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerGoalTracker;

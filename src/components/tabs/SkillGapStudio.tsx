import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, History, BookOpen, Clock, CheckCircle, ChevronRight, FileText, AlertCircle, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { EmptyState, SkeletonCard } from '../ui/states';
import { useAppContext } from '../../context/AppContext';

export default function SkillGapStudio() {
  const { user, profile } = useAppContext();
  const [activeTab, setActiveTab] = useState<'analyzer' | 'history'>('analyzer');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [opportunityId, setOpportunityId] = useState('');
  const [opportunityDescription, setOpportunityDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/v1/skill-gap/history', {
        headers: { 'Authorization': `Bearer ${user?.uid}` } // Replace with auth method logic if different
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.data.history);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAnalyze = async () => {
    if (!opportunityId && !opportunityDescription) {
      setError('Please provide an Opportunity ID or Job Description to analyze.');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const res = await fetch('/api/v1/skill-gap/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.uid}` // Replace as needed
        },
        body: JSON.stringify({ opportunityId, opportunityDescription })
      });
      
      const data = await res.json();
      if (data.success) {
        setAnalysisResult(data.data.analysis);
      } else {
        setError(data.error || 'Failed to analyze skill gap.');
      }
    } catch (err) {
      setError('An error occurred during analysis.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleRoadmapItem = async (index: number) => {
    if (!analysisResult) return;
    
    const item = analysisResult.roadmap[index];
    const newStatus = !item.completed;
    
    // Optimistic update
    const updatedRoadmap = [...analysisResult.roadmap];
    updatedRoadmap[index].completed = newStatus;
    
    // Recalculate progress metrics optimistically
    const completedItems = updatedRoadmap.filter((item) => item.completed).length;
    const totalItems = updatedRoadmap.length;
    const completionRatio = completedItems / totalItems;
    const baseMatch = analysisResult.matchPercentage || 0;
    const progress = Math.round(baseMatch + (completionRatio * (100 - baseMatch)));

    setAnalysisResult({
      ...analysisResult,
      roadmap: updatedRoadmap,
      matchPercentage: progress
    });

    try {
      await fetch(`/api/v1/skill-gap/${analysisResult._id}/roadmap/${index}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.uid}`
        },
        body: JSON.stringify({ completed: newStatus })
      });
    } catch (err) {
      console.error('Failed to update roadmap item:', err);
    }
  };

  const chartData = [
    { name: 'Match', value: analysisResult?.matchPercentage || 0, fill: '#3b82f6' }
  ];

  return (
    <div className="flex flex-col h-full w-full space-y-6 pb-20">
      
      {/* Header section */}
      <div className="bg-surface rounded-2xl p-6 border border-border-theme shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">AI Skill Gap Analyzer</h1>
            <p className="text-sm text-text-muted">Discover what skills you're missing for a specific opportunity and get a personalized roadmap.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-theme">
        <button
          onClick={() => setActiveTab('analyzer')}
          className={`pb-3 px-4 font-medium text-sm transition-colors relative ${activeTab === 'analyzer' ? 'text-blue-600 dark:text-blue-400' : 'text-text-muted hover:text-text-primary'}`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Analyzer
          </div>
          {activeTab === 'analyzer' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 font-medium text-sm transition-colors relative ${activeTab === 'history' ? 'text-blue-600 dark:text-blue-400' : 'text-text-muted hover:text-text-primary'}`}
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History
          </div>
          {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />}
        </button>
      </div>

      {activeTab === 'analyzer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Input Side */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-surface rounded-2xl p-5 border border-border-theme shadow-sm space-y-4">
              <h3 className="font-semibold text-text-primary">Target Opportunity</h3>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted">Opportunity ID (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 64d9f..."
                  value={opportunityId}
                  onChange={e => setOpportunityId(e.target.value)}
                  className="w-full bg-background border border-border-theme rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-text-primary"
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-text-muted font-medium">
                <div className="h-px bg-border-theme flex-1"></div>
                OR
                <div className="h-px bg-border-theme flex-1"></div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 text-text-primary mb-1">Job / Opportunity Description</label>
                <textarea 
                  rows={6}
                  placeholder="Paste the job description here..."
                  value={opportunityDescription}
                  onChange={e => setOpportunityDescription(e.target.value)}
                  className="w-full bg-background border border-border-theme rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-text-primary"
                />
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Profile...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Analyze Fit</>
                )}
              </button>
            </div>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-2">
            {!analysisResult && !isAnalyzing && (
              <div className="h-full bg-surface rounded-2xl border border-border-theme flex items-center justify-center p-8">
                <EmptyState 
                  title="No Analysis Generated" 
                  description="Provide a job description and click 'Analyze Fit' to see your skill gaps and roadmap."
                />
              </div>
            )}
            
            {isAnalyzing && (
              <div className="h-full bg-surface rounded-2xl border border-border-theme p-6 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 border-4 border-blue-100 dark:border-blue-900/30 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="mt-4 text-lg font-bold text-text-primary">AI is evaluating your profile...</h3>
                <p className="text-sm text-text-muted max-w-md text-center mt-2">
                  We're comparing your skills, experience, and projects against the requirements of the opportunity to generate a personalized roadmap.
                </p>
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <div className="space-y-6">
                
                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Radial Progress */}
                  <div className="bg-surface rounded-2xl p-6 border border-border-theme shadow-sm flex items-center">
                    <div className="w-32 h-32 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                          cx="50%" cy="50%" 
                          innerRadius="70%" outerRadius="100%" 
                          barSize={12} 
                          data={chartData}
                          startAngle={90} endAngle={-270}
                        >
                          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                          <RadialBar background dataKey="value" cornerRadius={10} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <span className="text-2xl font-bold text-text-primary">{analysisResult.matchPercentage}%</span>
                        <span className="text-[10px] uppercase font-bold text-gray-500">Fit</span>
                      </div>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-lg font-bold text-text-primary">Readiness Score</h3>
                      <p className="text-sm text-text-muted mt-1">Based on your current profile and roadmap progress, this is how well you match the opportunity.</p>
                    </div>
                  </div>

                  {/* Skills Summary */}
                  <div className="bg-surface rounded-2xl p-6 border border-border-theme shadow-sm flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-text-primary mb-3">Skills Overview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-muted">Existing Skills</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">{analysisResult.existingSkills?.length || 0} found</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-muted">Missing Skills</span>
                        <span className="font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md">{analysisResult.missingSkills?.length || 0} needed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Missing Skills List */}
                {analysisResult.missingSkills?.length > 0 && (
                  <div className="bg-surface rounded-2xl border border-border-theme overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-border-theme flex items-center gap-2 bg-gray-50/50 bg-surface/50">
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-bold text-text-primary">Skills to Acquire</h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysisResult.missingSkills.map((skill: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl border border-gray-100 border-border-theme bg-gray-50/50 bg-background/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-text-primary text-sm">{skill.skill}</span>
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              skill.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              skill.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {skill.priority} Priority
                            </span>
                          </div>
                          <p className="text-xs text-text-muted">{skill.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline Roadmap */}
                {analysisResult.roadmap?.length > 0 && (
                  <div className="bg-surface rounded-2xl border border-border-theme shadow-sm">
                    <div className="px-6 py-4 border-b border-border-theme flex items-center gap-2 bg-gray-50/50 bg-surface/50">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <h3 className="text-sm font-bold text-text-primary">Learning Roadmap</h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="relative border-l-2 border-border-theme ml-3 md:ml-4 space-y-8">
                        {analysisResult.roadmap.map((item: any, i: number) => (
                          <div key={i} className="relative pl-6 md:pl-8">
                            <button 
                              onClick={() => handleToggleRoadmapItem(i)}
                              className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors bg-surface cursor-pointer ${
                                item.completed 
                                  ? 'border-emerald-500 text-emerald-500' 
                                  : 'border-gray-300 border-border-theme text-transparent hover:border-blue-400'
                              }`}
                            >
                              <CheckCircle className={`w-5 h-5 ${item.completed ? 'opacity-100' : 'opacity-0'}`} />
                            </button>

                            <div className={`p-4 rounded-xl border transition-all ${
                              item.completed 
                                ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' 
                                : 'bg-surface border-gray-200 bg-surface border-border-theme shadow-sm'
                            }`}>
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-3">
                                <div>
                                  <h4 className={`text-base font-bold ${item.completed ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                                    {item.skill}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    <div className="flex items-center gap-1 text-xs text-text-muted font-medium">
                                      <Clock className="w-3.5 h-3.5" />
                                      {item.estimatedWeeks} week{item.estimatedWeeks !== 1 ? 's' : ''}
                                    </div>
                                    {item.priority === 'high' && (
                                      <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-1.5 py-0.5 rounded">High Priority</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3 mt-3 pt-3 border-t border-gray-100 border-border-theme/50">
                                {item.project && (
                                  <div>
                                    <span className="text-xs font-bold text-gray-700 text-text-primary block mb-1">Project Idea:</span>
                                    <p className="text-sm text-gray-600 text-text-muted">{item.project}</p>
                                  </div>
                                )}
                                
                                {item.resources?.length > 0 && (
                                  <div>
                                    <span className="text-xs font-bold text-gray-700 text-text-primary block mb-1">Resources:</span>
                                    <ul className="space-y-1">
                                      {item.resources.map((res: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-1.5 text-sm text-gray-600 text-text-muted">
                                          <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                          <span dangerouslySetInnerHTML={{ __html: res.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-500 hover:underline">Link</a>') }} />
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingHistory ? (
            <SkeletonCard count={3} />
          ) : history.length === 0 ? (
            <div className="col-span-full py-12 flex justify-center">
               <EmptyState title="No History Found" description="You haven't run any skill gap analyses yet." />
            </div>
          ) : (
            history.map((item, idx) => (
              <div key={item._id} className="bg-surface rounded-2xl p-5 border border-border-theme shadow-sm flex flex-col hover:border-blue-300 transition-colors cursor-pointer" onClick={() => {
                setAnalysisResult(item);
                setActiveTab('analyzer');
              }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-2">
                    <h4 className="font-bold text-text-primary line-clamp-2 leading-tight">
                      {item.opportunityTitle || 'Custom Opportunity Analysis'}
                    </h4>
                    <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-blue-500 flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{item.matchPercentage}%</span>
                  </div>
                </div>
                
                <div className="mt-auto space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 text-text-muted bg-background/50 p-2 rounded-lg">
                    <span>Missing Skills:</span>
                    <span className="font-bold">{item.missingSkills?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 text-text-muted bg-background/50 p-2 rounded-lg">
                    <span>Roadmap Steps:</span>
                    <span className="font-bold">{item.roadmap?.length || 0}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 border-border-theme flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                  View Full Analysis <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

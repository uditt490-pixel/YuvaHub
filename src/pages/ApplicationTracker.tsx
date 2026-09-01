import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Building2, Calendar, CheckCircle, Clock, ExternalLink, MessageSquare, AlertCircle, XCircle, Award, Bookmark, Trash2, Edit3, X, Save, Plus } from 'lucide-react';
import { auth } from '../lib/firebase';
import { fetchApplications, updateApplicationTracker, deleteApplicationTracker } from '../services/apiClient';

interface Application {
  _id: string;
  opportunityId?: string;
  opportunity: {
    title: string;
    organization?: string;
    applyUrl?: string;
    location?: string;
    type?: string;
  };
  status: string;
  notes?: string;
  deadline?: string;
  updatedAt: string;
  createdAt?: string;
  platform?: string;
}

const COLUMNS = {
  saved: {
    id: 'saved',
    title: 'Saved',
    icon: <Bookmark className="w-5 h-5 text-amber-400" />,
    color: 'bg-amber-500/10 border-amber-500/20',
    headerColor: 'text-amber-400',
    statuses: ['saved', 'draft', 'interested', 'pending_confirmation', 'queued', 'retrying']
  },
  applied: {
    id: 'applied',
    title: 'Applied',
    icon: <CheckCircle className="w-5 h-5 text-blue-400" />,
    color: 'bg-blue-500/10 border-blue-500/20',
    headerColor: 'text-blue-400',
    statuses: ['applied', 'submitted', 'submitting', 'under_review']
  },
  interview: {
    id: 'interview',
    title: 'Interviewing',
    icon: <MessageSquare className="w-5 h-5 text-purple-400" />,
    color: 'bg-purple-500/10 border-purple-500/20',
    headerColor: 'text-purple-400',
    statuses: ['interview', 'interviewing', 'interview_scheduled']
  },
  offer: {
    id: 'offer',
    title: 'Offer Received',
    icon: <Award className="w-5 h-5 text-emerald-400" />,
    color: 'bg-emerald-500/10 border-emerald-500/20',
    headerColor: 'text-emerald-400',
    statuses: ['offer', 'selected']
  },
  rejected: {
    id: 'rejected',
    title: 'Rejected',
    icon: <XCircle className="w-5 h-5 text-red-400" />,
    color: 'bg-red-500/10 border-red-500/20',
    headerColor: 'text-red-400',
    statuses: ['rejected', 'failed']
  }
};

const DEFAULT_STATUS_FOR_COLUMN: Record<string, string> = {
  saved: 'saved',
  applied: 'submitted',
  interview: 'interviewing',
  offer: 'offer',
  rejected: 'rejected',
};

export const ApplicationTracker: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModalApp, setActiveModalApp] = useState<Application | null>(null);
  const [modalNotes, setModalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchApplications();
      setApplications(data.applications || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getColumnForStatus = (status: string) => {
    return Object.values(COLUMNS).find(col => col.statuses.includes(status))?.id || 'saved';
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const destColId = destination.droppableId;
    const newStatus = DEFAULT_STATUS_FOR_COLUMN[destColId];
    
    if (!newStatus) return;

    // Optimistic UI Update
    const originalApps = [...applications];
    const appIndex = applications.findIndex(app => app._id === draggableId || (app as any).id === draggableId);
    
    if (appIndex === -1) return;

    const newApps = [...applications];
    newApps[appIndex] = { ...newApps[appIndex], status: newStatus };
    setApplications(newApps);

    try {
      await updateApplicationTracker(draggableId, { status: newStatus });
    } catch (err) {
      console.error(err);
      // Revert on failure
      setApplications(originalApps);
    }
  };

  const handleOpenNotes = (app: Application) => {
    setActiveModalApp(app);
    setModalNotes(app.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!activeModalApp) return;
    const appId = activeModalApp._id || (activeModalApp as any).id;

    try {
      setSavingNotes(true);
      await updateApplicationTracker(appId, { notes: modalNotes });
      
      setApplications(prev => prev.map(a => 
        (a._id === appId || (a as any).id === appId) ? { ...a, notes: modalNotes } : a
      ));
      setActiveModalApp(null);
    } catch (err: any) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!window.confirm("Remove this opportunity from your application tracker?")) {
      return;
    }

    try {
      await deleteApplicationTracker(appId);
      setApplications(prev => prev.filter(a => a._id !== appId && (a as any).id !== appId));
      if (activeModalApp && (activeModalApp._id === appId || (activeModalApp as any).id === appId)) {
        setActiveModalApp(null);
      }
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="font-sans h-full pb-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              Opportunity Application Tracker
            </h1>
            <p className="text-text-muted mt-2">Track your job applications, interview stages, offers, and private notes on your interactive Kanban board.</p>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-5 items-start">
            {Object.values(COLUMNS).map((col) => {
              const colApps = applications.filter(app => getColumnForStatus(app.status) === col.id);
              
              return (
                <div key={col.id} className="flex flex-col h-full min-h-[550px]">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <div className="flex items-center gap-2">
                      {col.icon}
                      <h2 className={`font-bold text-sm tracking-wide ${col.headerColor}`}>{col.title}</h2>
                    </div>
                    <span className="text-xs font-semibold text-text-secondary bg-surface-secondary px-2.5 py-0.5 rounded-full border border-border-theme">
                      {colApps.length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 rounded-2xl p-3 border border-border-theme transition-all duration-300 min-h-[480px] ${
                          snapshot.isDraggingOver ? 'bg-surface-secondary/80 border-emerald-500/40 shadow-inner' : 'bg-surface/40'
                        }`}
                      >
                        <AnimatePresence>
                          {colApps.map((app, index) => {
                            const appId = app._id || (app as any).id;
                            return (
                              <Draggable key={appId} draggableId={appId} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{...provided.draggableProps.style}}
                                    className="mb-3 last:mb-0"
                                  >
                                    <motion.div
                                      layout
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      whileHover={{ y: -2 }}
                                      className={`p-4 rounded-xl border backdrop-blur-md shadow-sm transition-all cursor-grab active:cursor-grabbing ${col.color} ${
                                        snapshot.isDragging ? 'shadow-2xl ring-2 ring-emerald-500/50 z-50' : 'hover:border-border-theme hover:shadow-md'
                                      }`}
                                    >
                                      <div className="flex justify-between items-start gap-2 mb-2">
                                        <h3 className="font-semibold text-text-primary text-sm line-clamp-2 leading-snug">
                                          {app.opportunity?.title || 'Untitled Opportunity'}
                                        </h3>
                                        <div className="flex items-center gap-1 shrink-0">
                                          {app.opportunity?.applyUrl && (
                                            <a 
                                              href={app.opportunity.applyUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-1 text-text-secondary hover:text-emerald-400 transition-colors"
                                              onClick={(e) => e.stopPropagation()}
                                              title="Open Apply Link"
                                            >
                                              <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                          )}
                                          <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteApp(appId); }}
                                            className="p-1 text-text-muted hover:text-red-400 transition-colors"
                                            title="Delete Application"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                      
                                      {app.opportunity?.organization && (
                                        <div className="flex items-center gap-1.5 text-xs text-text-muted mb-3">
                                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                                          <span className="truncate">{app.opportunity.organization}</span>
                                        </div>
                                      )}

                                      {/* Private Notes preview / trigger */}
                                      <div 
                                        onClick={() => handleOpenNotes(app)}
                                        className="mb-3 p-2 rounded-lg bg-surface/70 border border-border-theme hover:border-emerald-500/40 text-xs cursor-pointer transition-colors group"
                                      >
                                        <div className="flex items-center justify-between text-text-muted group-hover:text-primary-blue mb-1">
                                          <span className="font-medium text-[11px] flex items-center gap-1">
                                            <Edit3 className="w-3 h-3" /> Private Notes
                                          </span>
                                          <span className="text-[10px] underline">Edit</span>
                                        </div>
                                        <p className="text-text-secondary text-[11px] line-clamp-2 italic">
                                          {app.notes ? app.notes : "Click to add private notes (e.g. interviewer names, prep tips)..."}
                                        </p>
                                      </div>

                                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-theme/50">
                                        <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                                          <Calendar className="w-3 h-3 text-text-muted" />
                                          <span>{new Date(app.updatedAt || app.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-surface-secondary px-2 py-0.5 rounded-md border border-border-theme">
                                          {app.status}
                                        </span>
                                      </div>
                                    </motion.div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                        </AnimatePresence>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>

        {/* Private Notes Modal */}
        <AnimatePresence>
          {activeModalApp && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
              onClick={() => setActiveModalApp(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface border border-border-theme rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start border-b border-border-theme pb-3">
                  <div>
                    <h3 className="font-bold text-lg text-text-primary">
                      {activeModalApp.opportunity?.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {activeModalApp.opportunity?.organization || "YuvaHub Partner"} &bull; Stage: <span className="font-bold uppercase text-primary-blue">{activeModalApp.status}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModalApp(null)}
                    className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Private Application Notes
                  </label>
                  <textarea
                    rows={6}
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Add follow-up dates, interviewer names, resume versions used, salary discussions, or key takeaways..."
                    className="w-full bg-surface-secondary border border-border-theme rounded-xl p-3.5 text-xs text-text-primary outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => handleDeleteApp(activeModalApp._id || (activeModalApp as any).id)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Remove from Tracker
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveModalApp(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface-secondary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-blue hover:bg-blue-600 text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" /> {savingNotes ? "Saving..." : "Save Notes"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};


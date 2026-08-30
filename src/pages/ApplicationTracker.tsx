import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Building2, Calendar, CheckCircle, Clock, ExternalLink, MessageSquare, AlertCircle, XCircle, Award } from 'lucide-react';
import { auth } from '../lib/firebase';
import { fetchApplications } from '../services/apiClient';

interface Application {
  _id: string;
  opportunity: {
    title: string;
    organization?: string;
    applyUrl?: string;
  };
  status: string;
  updatedAt: string;
  platform?: string;
}

const COLUMNS = {
  drafts: {
    id: 'drafts',
    title: 'Saved/Drafts',
    icon: <Clock className="w-5 h-5 text-text-muted" />,
    color: 'bg-slate-500/10 border-slate-500/20',
    headerColor: 'text-text-muted',
    statuses: ['draft', 'pending_confirmation', 'queued', 'retrying']
  },
  applied: {
    id: 'applied',
    title: 'Applied',
    icon: <CheckCircle className="w-5 h-5 text-blue-400" />,
    color: 'bg-blue-500/10 border-blue-500/20',
    headerColor: 'text-blue-400',
    statuses: ['submitting', 'submitted']
  },
  interviewing: {
    id: 'interviewing',
    title: 'Interviewing',
    icon: <MessageSquare className="w-5 h-5 text-purple-400" />,
    color: 'bg-purple-500/10 border-purple-500/20',
    headerColor: 'text-purple-400',
    statuses: ['interviewing']
  },
  offers: {
    id: 'offers',
    title: 'Offers/Rejected',
    icon: <Award className="w-5 h-5 text-emerald-400" />,
    color: 'bg-emerald-500/10 border-emerald-500/20',
    headerColor: 'text-emerald-400',
    statuses: ['offer', 'rejected', 'failed']
  }
};

const DEFAULT_STATUS_FOR_COLUMN: Record<string, string> = {
  drafts: 'draft',
  applied: 'submitted',
  interviewing: 'interviewing',
  offers: 'offer',
};

export const ApplicationTracker: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await fetchApplications();
      setApplications(data.applications || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getColumnForStatus = (status: string) => {
    return Object.values(COLUMNS).find(col => col.statuses.includes(status))?.id || 'drafts';
  };

  const updateStatusBackend = async (id: string, status: string) => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`/api/v1/applications/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      throw new Error('Failed to update status');
    }
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
    const appIndex = applications.findIndex(app => app._id === draggableId);
    
    if (appIndex === -1) return;

    const newApps = [...applications];
    newApps[appIndex] = { ...newApps[appIndex], status: newStatus };
    setApplications(newApps);

    try {
      await updateStatusBackend(draggableId, newStatus);
    } catch (err) {
      console.error(err);
      // Revert on failure
      setApplications(originalApps);
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
    <div className="font-sans h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              Application Tracker
            </h1>
            <p className="text-text-muted mt-2">Manage your pipeline and track your success.</p>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
            {Object.values(COLUMNS).map((col) => {
              const colApps = applications.filter(app => getColumnForStatus(app.status) === col.id);
              
              return (
                <div key={col.id} className="flex flex-col h-full min-h-[500px]">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                      {col.icon}
                      <h2 className={`font-semibold ${col.headerColor}`}>{col.title}</h2>
                    </div>
                    <span className="text-xs font-medium text-text-secondary bg-surface-secondary px-2 py-1 rounded-full">
                      {colApps.length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 rounded-xl p-3 border border-border-theme transition-colors duration-300 ${
                          snapshot.isDraggingOver ? 'bg-surface-secondary border-emerald-500/30' : 'bg-transparent'
                        }`}
                      >
                        <AnimatePresence>
                          {colApps.map((app, index) => (
                            <Draggable key={app._id} draggableId={app._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{...provided.draggableProps.style}}
                                  className={`mb-3 last:mb-0`}
                                >
                                  <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    whileHover={{ y: -2, scale: 1.02 }}
                                    className={`p-4 rounded-xl border backdrop-blur-sm shadow-xl transition-all ${col.color} ${
                                      snapshot.isDragging ? 'shadow-2xl ring-2 ring-emerald-500/50 z-50' : 'hover:border-border-theme'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start gap-2 mb-3">
                                      <h3 className="font-medium text-text-primary line-clamp-2 leading-tight">
                                        {app.opportunity.title}
                                      </h3>
                                      {app.opportunity.applyUrl && (
                                        <a 
                                          href={app.opportunity.applyUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-text-secondary hover:text-emerald-400 transition-colors"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <ExternalLink className="w-4 h-4" />
                                        </a>
                                      )}
                                    </div>
                                    
                                    {app.opportunity.organization && (
                                      <div className="flex items-center gap-1.5 text-sm text-text-muted mb-4">
                                        <Building2 className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{app.opportunity.organization}</span>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-theme/50">
                                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{new Date(app.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                      </div>
                                      
                                      {app.status === 'rejected' && (
                                        <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                                          <XCircle className="w-3 h-3" />
                                          Rejected
                                        </span>
                                      )}
                                      {app.status === 'offer' && (
                                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                          <Award className="w-3 h-3" />
                                          Offer
                                        </span>
                                      )}
                                    </div>
                                  </motion.div>
                                </div>
                              )}
                            </Draggable>
                          ))}
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
      </div>
    </div>
  );
};

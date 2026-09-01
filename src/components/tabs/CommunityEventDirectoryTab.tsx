import React, { useState } from 'react';
import { Calendar, Filter, PlusCircle } from 'lucide-react';
import { MOCK_COMMUNITY_EVENTS, CommunityEvent } from '../../services/eventDirectoryEngine';
import { EventCard } from './EventCard';

export const CommunityEventDirectoryTab: React.FC = () => {
    const [events, setEvents] = useState<CommunityEvent[]>(MOCK_COMMUNITY_EVENTS);
    const [filterType, setFilterType] = useState<string>('all');

    const handleToggleRegister = (eventId: string) => {
        setEvents(prev => prev.map(evt => {
            if (evt.id === eventId) {
                const nextState = !evt.isRegistered;
                return {
                    ...evt,
                    isRegistered: nextState,
                    registeredCount: nextState ? evt.registeredCount + 1 : evt.registeredCount - 1
                };
            }
            return evt;
        }));
    };

    const filteredEvents = events.filter(evt => {
        if (filterType === 'all') return true;
        return evt.eventType === filterType;
    });

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 text-slate-100 font-sans">
            {/* Header Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                            <Calendar className="w-4 h-4" /> YuvaHub Global Community Events
                        </div>
                        <h1 className="text-2xl font-black text-slate-100 mt-1">Hackathons & Technical Workshops</h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => alert("Opening propose event modal...")}
                        className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" /> Propose Community Event
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            filterType === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                    >
                        All Events ({events.length})
                    </button>
                    <button
                        onClick={() => setFilterType('hackathon')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            filterType === 'hackathon' ? 'bg-amber-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                    >
                        Hackathons
                    </button>
                    <button
                        onClick={() => setFilterType('workshop')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            filterType === 'workshop' ? 'bg-teal-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                    >
                        Workshops
                    </button>
                    <button
                        onClick={() => setFilterType('tech_talk')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            filterType === 'tech_talk' ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                    >
                        Tech Talks
                    </button>
                </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((evt) => (
                    <EventCard key={evt.id} event={evt} onToggleRegister={handleToggleRegister} />
                ))}
            </div>
        </div>
    );
};

export default CommunityEventDirectoryTab;

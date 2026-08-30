import React from 'react';
import { Calendar, Clock, Trophy, Users, CheckCircle2, ExternalLink, Video } from 'lucide-react';
import { CommunityEvent, generateCalendarLink } from '../../services/eventDirectoryEngine';
import { EventRsvpButton } from '../ui/EventRsvpButton';

interface EventCardProps {
    event: CommunityEvent;
    onToggleRegister: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onToggleRegister }) => {
    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-4 hover:border-indigo-500/50 transition-all flex flex-col justify-between">
            {/* Banner Image */}
            <div className="h-40 w-full relative overflow-hidden bg-slate-950">
                <img src={event.bannerImageUrl} alt={event.title} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-indigo-400 uppercase">
                        {event.eventType.replace('_', ' ')}
                    </span>
                    {event.prizePool && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> {event.prizePool}
                        </span>
                    )}
                </div>
            </div>

            {/* Content Details */}
            <div className="px-5 space-y-3 flex-1">
                <h3 className="text-base font-bold text-slate-100 leading-snug">{event.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{event.description}</p>

                <div className="space-y-1.5 text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{event.startDate} • {event.timeString}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-400">Host: {event.hostName}</span>
                        <span className="text-teal-400 font-bold flex items-center gap-1">
                            <Users className="w-3 h-3" /> {event.registeredCount} Registered
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                    {event.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 pt-2 flex items-center gap-2">
                <div className="flex-1">
                    <EventRsvpButton
                        eventId={event.id}
                        initialStatus={event.isRegistered ? 'registered' : 'none'}
                        initialRegisteredCount={event.registeredCount}
                        maxCapacity={event.maxCapacity}
                    />
                </div>

                <a
                    href={generateCalendarLink(event)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                    title="Add to Google Calendar"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
};

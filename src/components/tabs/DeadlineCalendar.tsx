import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Bell, Download, Clock, MapPin, Building, X } from 'lucide-react';
import { fetchCalendarEvents, setDeadlineReminder, deleteDeadlineReminder, downloadCalendarICS } from '../../services/apiClient';

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  organization: string;
  deadline: string;
  link: string;
}

interface Reminder {
  _id: string;
  id: string;
  opportunityId: string;
  reminderOffsets: number[];
  channels: string[];
}

const DeadlineCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedOffsets, setSelectedOffsets] = useState<number[]>([24, 48]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchCalendarEvents();
      setEvents(data.events || []);
      setReminders(data.reminders || []);
    } catch (err) {
      console.error("Failed to load calendar events:", err);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getEventsForDate = (day: number) => {
    return events.filter(e => {
      const d = new Date(e.deadline);
      return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  };

  const getEventColor = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('hackathon')) return 'bg-purple-500';
    if (lower.includes('scholarship') || lower.includes('fellowship')) return 'bg-yellow-500';
    if (lower.includes('job') || lower.includes('internship')) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const handleExportAll = () => {
    const oppIds = events.map(e => e.id);
    if (oppIds.length > 0) {
      downloadCalendarICS(oppIds).catch(err => console.error(err));
    }
  };

  const handleExportSingle = (id: string) => {
    downloadCalendarICS([id]).catch(err => console.error(err));
  };

  const handleSaveReminder = async () => {
    if (!activeEvent) return;
    try {
      await setDeadlineReminder({
        opportunityId: activeEvent.id,
        opportunityTitle: activeEvent.title,
        deadlineDate: activeEvent.deadline,
        reminderOffsets: selectedOffsets,
        channels: ['email', 'push']
      });
      await loadData();
      setReminderModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      await deleteDeadlineReminder(reminderId);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-900 overflow-y-auto w-full p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Deadline Calendar</h1>
            <p className="text-gray-500 mt-1">Track your bookmarked and applied opportunities</p>
          </div>
          <button 
            onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            <Download className="w-4 h-4 text-gray-600" />
            Export All to ICS
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Calendar Grid */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <h2 className="text-xl font-semibold">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-3 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[100px] sm:min-h-[120px] p-2 border-r border-b border-gray-100 bg-gray-50/30" />
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayEvents = getEventsForDate(day);
                  const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                  const isSelected = selectedDay?.getDate() === day;
                  const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(new Date().setHours(0,0,0,0));

                  return (
                    <div 
                      key={day} 
                      onClick={() => setSelectedDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                      className={`min-h-[100px] sm:min-h-[120px] p-2 border-r border-b border-gray-100 cursor-pointer transition-colors relative
                        ${isSelected ? 'bg-purple-50/50' : 'hover:bg-gray-50'}
                        ${isPast ? 'opacity-50' : ''}
                      `}
                    >
                      <div className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1
                        ${isToday ? 'bg-purple-600 text-white shadow-md' : 'text-gray-700'}
                      `}>
                        {day}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.map(e => (
                          <div 
                            key={e.id}
                            className={`text-xs px-2 py-1 rounded truncate flex items-center gap-1 text-white shadow-sm ${getEventColor(e.type)}`}
                            title={e.title}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white/50 flex-shrink-0" />
                            {e.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Side Panel */}
            <div className={`w-full lg:w-96 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px] transition-all
              ${selectedDay ? 'opacity-100' : 'opacity-50 pointer-events-none'}
            `}>
              <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  {selectedDay ? selectedDay.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' }) : 'Select a date'}
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedDay && getEventsForDate(selectedDay.getDate()).length > 0 ? (
                  getEventsForDate(selectedDay.getDate()).map(e => {
                    const existingReminder = reminders.find(r => r.opportunityId === e.id);
                    return (
                      <div key={e.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 leading-tight">{e.title}</h4>
                          <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded text-white ${getEventColor(e.type)}`}>
                            {e.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                          <Building className="w-3 h-3" /> {e.organization}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                          <a href={e.link} target="_blank" rel="noreferrer" className="text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 px-2 py-1 rounded">
                            View Details
                          </a>
                          <button 
                            onClick={() => handleExportSingle(e.id)}
                            className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> ICS
                          </button>
                          
                          {existingReminder ? (
                            <div className="w-full flex items-center justify-between bg-green-50 text-green-700 text-xs px-2 py-1.5 rounded mt-2">
                              <span className="flex items-center gap-1"><Bell className="w-3 h-3"/> Reminder Set</span>
                              <button onClick={() => handleDeleteReminder(existingReminder._id || existingReminder.id)} className="hover:text-green-900 underline">Remove</button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => { setActiveEvent(e); setReminderModalOpen(true); }}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded flex items-center gap-1 w-full justify-center mt-2"
                            >
                              <Bell className="w-3 h-3" /> Set Reminder
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                    <Calendar className="w-12 h-12 opacity-20" />
                    <p>No deadlines on this date.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Reminder Modal */}
      {reminderModalOpen && activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Bell className="w-5 h-5 text-purple-600"/> Set Reminder</h3>
              <button onClick={() => setReminderModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">When do you want to be reminded about <strong>{activeEvent.title}</strong>?</p>
              
              <div className="space-y-3">
                {[
                  { label: '24 Hours Before', value: 24 },
                  { label: '48 Hours Before', value: 48 },
                  { label: '1 Week Before', value: 168 }
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      checked={selectedOffsets.includes(opt.value)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedOffsets(prev => [...prev, opt.value]);
                        else setSelectedOffsets(prev => prev.filter(v => v !== opt.value));
                      }}
                    />
                    <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                  </label>
                ))}
              </div>
              
              <div className="mt-6 flex gap-3">
                <button onClick={() => setReminderModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                  Cancel
                </button>
                <button 
                  onClick={handleSaveReminder}
                  disabled={selectedOffsets.length === 0}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
                >
                  Save Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeadlineCalendar;

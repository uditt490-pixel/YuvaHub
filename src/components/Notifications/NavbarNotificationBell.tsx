import React, { useState } from 'react';
import { Bell, Check, CheckCheck, ExternalLink, MessageSquare, UserPlus, Award, Info, X } from 'lucide-react';
import { useNotifications } from './NotificationToastProvider';
import { useAppContext } from '../../context/AppContext';

export const NavbarNotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { setActiveTab } = useAppContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleNotificationClick = async (notif: any) => {
    const id = notif.id || notif._id;
    if (id) {
      await markAsRead(id);
    }
    setIsOpen(false);

    if (notif.link) {
      if (notif.link.includes('community') || notif.link.includes('forum')) {
        setActiveTab('community');
      } else if (notif.link.includes('mentorship') || notif.link.includes('alumni')) {
        setActiveTab('mentorship');
      } else if (notif.link.includes('opportunities')) {
        setActiveTab('opportunities');
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shadow-lg border-2 border-slate-950 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden font-sans text-white animate-fade-in">
          {/* Dropdown Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span className="font-extrabold text-sm text-white">In-App Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black border border-indigo-500/30">
                  {unreadCount} New
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => {
                const isRead = notif.isRead || notif.read;
                return (
                  <div
                    key={notif.id || notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 transition cursor-pointer flex items-start justify-between gap-3 ${
                      isRead
                        ? 'bg-slate-900 text-slate-400 hover:bg-slate-800/60'
                        : 'bg-indigo-950/30 text-white hover:bg-indigo-900/40 border-l-4 border-l-indigo-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        {notif.type === 'team_invite' ? (
                          <UserPlus className="w-4 h-4 text-indigo-400" />
                        ) : notif.type === 'forum_reply' ? (
                          <MessageSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Award className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold leading-snug">
                          {notif.content}
                        </p>
                        <span className="text-[10px] text-slate-500 block font-medium">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                      </div>
                    </div>

                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

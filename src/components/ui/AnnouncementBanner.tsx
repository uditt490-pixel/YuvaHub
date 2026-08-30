import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Info, Megaphone, AlertTriangle } from 'lucide-react';
import { fetchActiveAnnouncements, dismissAnnouncement } from '../../services/apiClient';
import { useAppContext } from '../../context/AppContext';

export default function AnnouncementBanner() {
  const { user } = useAppContext();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const response = await fetchActiveAnnouncements();
        if (response?.data && Array.isArray(response.data)) {
          // Filter out locally dismissed ones if not logged in
          const localDismissedStr = localStorage.getItem('yuvahub-dismissed-announcements') || '[]';
          const localDismissed = JSON.parse(localDismissedStr);
          
          const validAnnouncements = response.data.filter((a: any) => {
            if (a.dismissedBy?.includes(user?.uid)) return false;
            if (!user && localDismissed.includes(a.id)) return false;
            // Banner usually shows high/critical or pinned
            return true;
          });

          if (validAnnouncements.length > 0) {
            setAnnouncements(validAnnouncements);
            setIsVisible(true);
          }
        }
      } catch (err) {
        console.error("Failed to load announcements", err);
      }
    };

    loadAnnouncements();
  }, [user]);

  if (!isVisible || announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  const handleDismiss = async () => {
    if (currentAnnouncement.priority === 'critical') return; // Cannot dismiss critical

    // Dismiss locally
    const localDismissedStr = localStorage.getItem('yuvahub-dismissed-announcements') || '[]';
    const localDismissed = JSON.parse(localDismissedStr);
    localDismissed.push(currentAnnouncement.id);
    localStorage.setItem('yuvahub-dismissed-announcements', JSON.stringify(localDismissed));

    // Dismiss on backend if logged in
    if (user) {
      try {
        await dismissAnnouncement(currentAnnouncement.id);
      } catch (err) {
        console.error("Failed to dismiss announcement on server", err);
      }
    }

    // Move to next or hide
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsVisible(false);
    }
  };

  const getStyleForPriority = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white border-red-700';
      case 'high': return 'bg-amber-500 text-white border-amber-600';
      case 'normal': return 'bg-blue-600 text-white border-blue-700';
      default: return 'bg-gray-800 text-white border-gray-900 dark:bg-gray-700';
    }
  };

  const getIconForPriority = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertCircle className="w-5 h-5 shrink-0" />;
      case 'high': return <AlertTriangle className="w-5 h-5 shrink-0" />;
      case 'normal': return <Megaphone className="w-5 h-5 shrink-0" />;
      default: return <Info className="w-5 h-5 shrink-0" />;
    }
  };

  return (
    <div className={`w-full z-50 flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8 border-b ${getStyleForPriority(currentAnnouncement.priority)} transition-all duration-300`}>
      <div className="flex items-center gap-3 flex-1">
        {getIconForPriority(currentAnnouncement.priority)}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <span className="font-bold text-sm">{currentAnnouncement.title}</span>
          <span className="text-xs opacity-90 hidden sm:inline-block">
            {/* Strip markdown for banner preview */}
            {currentAnnouncement.body.replace(/[#*`_~\[\]()]/g, '').substring(0, 100)}
            {currentAnnouncement.body.length > 100 ? '...' : ''}
          </span>
        </div>
      </div>
      
      {currentAnnouncement.priority !== 'critical' && (
        <button 
          onClick={handleDismiss}
          className="p-1 hover:bg-black/10 rounded-full transition-colors ml-4 shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

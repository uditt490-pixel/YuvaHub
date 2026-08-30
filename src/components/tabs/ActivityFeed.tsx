import React, { useState, useEffect } from 'react';
import { Activity, Settings, TrendingUp, Trophy, Flame, ChevronRight, Filter } from 'lucide-react';
import { fetchActivityFeed, fetchActivityStats, getDigestPreferences, updateDigestPreferences } from '../../services/apiClient';

interface ActivityEvent {
  id: string;
  type: string;
  createdAt: number;
  points?: number;
  metadata?: any;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState({ totalActions: 0, weeklyKarma: 0, streak: 0 });
  const [digestFreq, setDigestFreq] = useState<"Daily" | "Weekly" | "None">("None");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("");

  useEffect(() => {
    loadData();
  }, [typeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [feedData, statsData, prefsData] = await Promise.all([
        fetchActivityFeed(1, 20, typeFilter),
        fetchActivityStats(),
        getDigestPreferences()
      ]);
      setActivities(feedData.items || []);
      if (statsData.data) setStats(statsData.data);
      if (prefsData.data) setDigestFreq(prefsData.data.frequency || "None");
      setPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    try {
      const feedData = await fetchActivityFeed(nextPage, 20, typeFilter);
      if (feedData.items && feedData.items.length > 0) {
        setActivities(prev => [...prev, ...feedData.items]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateDigest = async (freq: "Daily" | "Weekly" | "None") => {
    try {
      await updateDigestPreferences(freq);
      setDigestFreq(freq);
    } catch (err) {
      console.error(err);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bounty_posted':
      case 'bounty_accepted':
      case 'bounty_resolved':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'code_review_requested':
      case 'code_review_claimed':
      case 'code_review_completed':
        return <Activity className="w-5 h-5 text-primary-blue" />;
      case 'karma_earned':
      case 'karma_spent':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      default:
        return <Activity className="w-5 h-5 text-text-muted" />;
    }
  };

  const getActivityDescription = (activity: ActivityEvent) => {
    switch (activity.type) {
      case 'bounty_posted': return `Posted a new bounty: ${activity.metadata?.title || 'Unknown'}`;
      case 'bounty_accepted': return `Accepted a bounty challenge`;
      case 'bounty_resolved': return `Resolved a bounty`;
      case 'code_review_requested': return `Requested a code review for ${activity.metadata?.title || 'Unknown'}`;
      case 'code_review_claimed': return `Claimed a code review`;
      case 'code_review_completed': return `Completed a code review`;
      case 'karma_earned': return `Earned ${activity.points} karma`;
      case 'karma_spent': return `Spent ${Math.abs(activity.points || 0)} karma`;
      default: return `Performed an action`;
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((timestamp - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (Math.abs(daysDifference) > 30) {
      return new Date(timestamp).toLocaleDateString();
    } else if (daysDifference === 0) {
      return 'Today';
    } else {
      return rtf.format(daysDifference, 'day');
    }
  };

  return (
    <div className="w-full mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary-blue" />
            Activity Feed
          </h1>
          <p className="text-text-muted mt-1">Track your contributions and karma</p>
        </div>

        <div className="flex items-center gap-2 text-sm bg-surface border border-border-theme rounded-lg p-2 shadow-sm">
          <Settings className="w-4 h-4 text-text-muted" />
          <span className="text-text-secondary font-medium mr-2">Digest:</span>
          <select 
            value={digestFreq}
            onChange={(e) => handleUpdateDigest(e.target.value as "Daily" | "Weekly" | "None")}
            className="border-none bg-surface-secondary rounded-md p-1 focus:ring-0 text-text-secondary font-medium outline-none"
          >
            <option value="None">None</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-xl shadow-sm border border-border-theme p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-muted font-medium">Total Actions</h3>
            <Activity className="w-5 h-5 text-primary-blue" />
          </div>
          <span className="text-3xl font-bold text-text-primary">{stats.totalActions}</span>
        </div>
        
        <div className="bg-surface rounded-xl shadow-sm border border-border-theme p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-muted font-medium">Weekly Karma</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <span className="text-3xl font-bold text-text-primary">+{stats.weeklyKarma}</span>
        </div>

        <div className="bg-surface rounded-xl shadow-sm border border-border-theme p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-muted font-medium">Active Streak</h3>
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <span className="text-3xl font-bold text-text-primary">{stats.streak} Days</span>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border-theme overflow-hidden">
        <div className="p-4 border-b border-border-theme flex justify-between items-center bg-surface-secondary">
          <h2 className="font-semibold text-text-primary">Timeline</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border-border-theme rounded-md py-1 px-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Activities</option>
              <option value="bounty_posted">Bounties</option>
              <option value="code_review_completed">Reviews</option>
              <option value="karma_earned">Karma</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {loading && activities.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Activity className="w-12 h-12 mx-auto mb-3 text-text-muted" />
              <p>No activity found. Start contributing!</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-border-theme ml-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className={`relative pl-8 ${index !== activities.length - 1 ? 'pb-8' : ''}`}>
                  <div className="absolute -left-2.5 top-0 bg-surface rounded-full p-1 border border-border-theme shadow-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="bg-surface-secondary rounded-lg p-4 border border-border-theme flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:shadow-md transition-shadow">
                    <div>
                      <p className="text-text-primary font-medium">{getActivityDescription(activity)}</p>
                      <p className="text-sm text-text-muted mt-1">{formatRelativeTime(activity.createdAt)}</p>
                    </div>
                    {activity.points !== undefined && activity.points !== 0 && (
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${activity.points > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {activity.points > 0 ? '+' : ''}{activity.points} Karma
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activities.length > 0 && !loading && activities.length % 20 === 0 && (
            <div className="mt-8 text-center">
              <button 
                onClick={loadMore}
                className="px-4 py-2 text-sm font-medium text-primary-blue hover:text-primary-blue hover:bg-primary-blue/20 rounded-lg transition-colors flex items-center gap-1 mx-auto"
              >
                Load More <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

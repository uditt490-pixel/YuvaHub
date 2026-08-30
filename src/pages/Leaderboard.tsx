import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Award, Medal, Crown } from "lucide-react";
import { fetchLeaderboard } from "../services/apiClient";

interface LeaderboardUser {
  uid: string;
  name: string;
  avatarUrl?: string;
  points: number;
  badges?: string[];
}

export const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLeaderboard = async () => {
      try {
        const response = await fetchLeaderboard();
        setUsers(response.data?.leaderboard || []);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    getLeaderboard();
  }, []);

  const getRankHighlight = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-[#fff9e6] to-[#fff2cc] shadow-[#fcd34d]/20 shadow-lg scale-[1.02] border-[#fcd34d] border-2";
      case 1:
        return "bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] shadow-[#ced4da]/20 shadow-md scale-[1.01] border-[#dee2e6] border-2";
      case 2:
        return "bg-gradient-to-r from-[#fff3eb] to-[#ffe8d6] shadow-[#fdba74]/20 shadow-md scale-[1.01] border-[#fdba74] border-2";
      default:
        return "bg-surface hover:shadow-md transition-shadow border border-border-theme";
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-[#fbbf24]" />;
      case 1:
        return <Medal className="w-6 h-6 text-[#9ca3af]" />;
      case 2:
        return <Award className="w-6 h-6 text-[#f97316]" />;
      default:
        return <span className="font-bold text-text-muted">#{index + 1}</span>;
    }
  };

  if (loading) {
    return (
      <div className="font-sans h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-blue/30 border-t-[#b56b37] rounded-full animate-spin"></div>
          <p className="text-sm text-text-secondary font-medium animate-pulse">Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans h-full">
      <div className="w-full pt-10 px-4 sm:px-6 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f3e4bd] border border-border-theme text-text-secondary text-xs font-bold uppercase tracking-widest rounded-full">
            <Trophy className="w-3.5 h-3.5 text-primary-blue" /> Community Rankings
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight text-text-primary">
            Global <span className="italic text-primary-blue">Leaderboard</span>
          </h1>
          <p className="text-sm text-text-secondary max-w-xl mx-auto">
            Top contributors making a difference in the YuvaHub community. Earn points by helping others, sharing resources, and being active!
          </p>
        </motion.div>

        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-12 bg-surface border border-border-theme rounded-2xl shadow-sm">
              <p className="text-sm text-text-muted">No users found. Be the first to earn points!</p>
            </div>
          ) : (
            users.map((user, index) => (
              <motion.div
                key={user.uid}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative flex items-center p-4 sm:p-5 rounded-2xl ${getRankHighlight(index)}`}
              >
                <div className="flex-shrink-0 w-12 text-center flex justify-center">
                  {getRankIcon(index)}
                </div>

                <div className="flex-shrink-0 mx-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-secondary border border-border-theme flex items-center justify-center shadow-sm">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-text-secondary">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-grow min-w-0">
                  <h2 className="text-base font-bold text-text-primary truncate">
                    {user.name}
                  </h2>
                  {user.badges && user.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {user.badges.map((badge, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-secondary text-primary-blue border border-border-theme">
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 text-right ml-4">
                  <div className="text-xl font-bold text-primary-blue">
                    {user.points.toLocaleString()}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-text-muted font-bold">
                    Points
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

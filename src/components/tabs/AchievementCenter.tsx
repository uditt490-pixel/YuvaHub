import React, { useState, useMemo, useCallback } from 'react';
import {
  Trophy, Award, Star, Zap, Flame, Target, CheckCircle, Lock, Clock,
  TrendingUp, Users, Crown, Medal, Shield, Heart, Brain, Rocket, Eye,
  Code, BookOpen, GitBranch, MessageCircle, Share2, Sparkles, Gift,
  Calendar, BarChart3, ArrowRight, ChevronRight, Trophy as TrophyIcon,
  Lightbulb, Diamond, Gem, BadgeCheck, Swords, Crosshair, Compass,
  Map, Footprints, Milestone, Flag, Sun, Moon, Cloud, Umbrella, LayoutDashboard
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type AchievementCategory = 'coding' | 'learning' | 'community' | 'streak' | 'social' | 'challenge' | 'special';
type ChallengeStatus = 'active' | 'upcoming' | 'completed';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  category: AchievementCategory;
  xpReward: number;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
  isEarned: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: AchievementCategory;
  xpReward: number;
  tier: number; // 1-3
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedDate?: string;
  reward: string;
}

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: AchievementCategory;
  status: ChallengeStatus;
  xpReward: number;
  progress: number;
  maxProgress: number;
  startDate: string;
  endDate: string;
  participants: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  weeklyData: { day: string; active: boolean; hours: number }[];
  monthlyActive: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  badges: number;
  streak: number;
  isCurrentUser: boolean;
  change: number; // rank change
}

interface GamificationStats {
  totalXP: number;
  level: number;
  xpToNext: number;
  totalBadges: number;
  earnedBadges: number;
  totalAchievements: number;
  unlockedAchievements: number;
  challengesCompleted: number;
  weeklyXP: number;
  monthlyXP: number;
}

// ─── Data ──────────────────────────────────────────────────────────
const BADGES: Badge[] = [
  { id: 'b1', name: 'First Commit', description: 'Made your very first code commit', icon: '🎉', rarity: 'common', category: 'coding', xpReward: 50, isEarned: true, earnedDate: '2026-03-15' },
  { id: 'b2', name: '100 Commits', description: 'Reached 100 code commits', icon: '💯', rarity: 'uncommon', category: 'coding', xpReward: 200, isEarned: true, earnedDate: '2026-06-20' },
  { id: 'b3', name: 'Bug Squasher', description: 'Fixed 10 bugs in open source projects', icon: '🐛', rarity: 'uncommon', category: 'coding', xpReward: 150, isEarned: true, earnedDate: '2026-07-10' },
  { id: 'b4', name: 'Code Wizard', description: 'Contributed to 5 different repositories', icon: '🧙', rarity: 'rare', category: 'coding', xpReward: 300, isEarned: true, earnedDate: '2026-08-01' },
  { id: 'b5', name: 'Full-Stack Hero', description: 'Built and deployed a full-stack application', icon: '🦸', rarity: 'rare', category: 'coding', xpReward: 500, isEarned: true, earnedDate: '2026-08-15' },
  { id: 'b6', name: '1000 Commits', description: 'Reached 1000 code commits', icon: '🔥', rarity: 'epic', category: 'coding', xpReward: 1000, isEarned: false, progress: 672, maxProgress: 1000 },
  { id: 'b7', name: 'Open Source Maintainer', description: 'Maintain an open source project with 100+ stars', icon: '⭐', rarity: 'epic', category: 'coding', xpReward: 800, isEarned: false, progress: 67, maxProgress: 100 },
  { id: 'b8', name: 'Code Legend', description: 'Reach 5000 commits across all projects', icon: '👑', rarity: 'legendary', category: 'coding', xpReward: 2500, isEarned: false, progress: 672, maxProgress: 5000 },
  { id: 'b9', name: 'Week Warrior', description: 'Maintained a 7-day learning streak', icon: '⚔️', rarity: 'common', category: 'streak', xpReward: 100, isEarned: true, earnedDate: '2026-04-01' },
  { id: 'b10', name: 'Month Master', description: 'Maintained a 30-day learning streak', icon: '🗓️', rarity: 'rare', category: 'streak', xpReward: 400, isEarned: true, earnedDate: '2026-06-01' },
  { id: 'b11', name: 'Century Streak', description: 'Maintained a 100-day learning streak', icon: '💎', rarity: 'epic', category: 'streak', xpReward: 1200, isEarned: false, progress: 45, maxProgress: 100 },
  { id: 'b12', name: 'Unstoppable', description: 'Maintained a 365-day learning streak', icon: '🌟', rarity: 'legendary', category: 'streak', xpReward: 5000, isEarned: false, progress: 45, maxProgress: 365 },
  { id: 'b13', name: 'First Review', description: 'Reviewed your first code PR', icon: '👀', rarity: 'common', category: 'community', xpReward: 50, isEarned: true, earnedDate: '2026-03-20' },
  { id: 'b14', name: 'Helping Hand', description: 'Answered 10 community questions', icon: '🤝', rarity: 'uncommon', category: 'community', xpReward: 200, isEarned: true, earnedDate: '2026-05-15' },
  { id: 'b15', name: 'Mentor', description: 'Mentored 5 junior developers', icon: '🎓', rarity: 'rare', category: 'social', xpReward: 400, isEarned: false, progress: 2, maxProgress: 5 },
  { id: 'b16', name: 'Hackathon Champion', description: 'Won first place in a hackathon', icon: '🏆', rarity: 'epic', category: 'challenge', xpReward: 800, isEarned: true, earnedDate: '2026-07-20' },
  { id: 'b17', name: 'Speed Demon', description: 'Solved 5 coding challenges in under 1 hour', icon: '⚡', rarity: 'uncommon', category: 'challenge', xpReward: 250, isEarned: true, earnedDate: '2026-08-10' },
  { id: 'b18', name: 'Algorithm Ace', description: 'Solved 50 algorithm problems', icon: '🧮', rarity: 'rare', category: 'challenge', xpReward: 500, isEarned: false, progress: 38, maxProgress: 50 },
  { id: 'b19', name: 'AI Pioneer', description: 'Completed an AI/ML project from scratch', icon: '🤖', rarity: 'epic', category: 'special', xpReward: 700, isEarned: false, progress: 1, maxProgress: 3 },
  { id: 'b20', name: 'Community Star', description: 'Received 100 upvotes on your contributions', icon: '💫', rarity: 'rare', category: 'social', xpReward: 400, isEarned: true, earnedDate: '2026-08-05' },
  { id: 'b21', name: 'Night Owl', description: 'Completed 10 learning sessions after midnight', icon: '🦉', rarity: 'uncommon', category: 'streak', xpReward: 150, isEarned: true, earnedDate: '2026-05-20' },
  { id: 'b22', name: 'Diverse Developer', description: 'Used 8+ different programming languages', icon: '🌈', rarity: 'rare', category: 'coding', xpReward: 350, isEarned: false, progress: 6, maxProgress: 8 },
  { id: 'b23', name: 'Git Master', description: 'Made 500 git operations without conflicts', icon: '📦', rarity: 'uncommon', category: 'coding', xpReward: 200, isEarned: true, earnedDate: '2026-07-01' },
  { id: 'b24', name: 'Portfolio Pro', description: 'Showcased 10 projects in your portfolio', icon: '💼', rarity: 'uncommon', category: 'social', xpReward: 200, isEarned: false, progress: 7, maxProgress: 10 },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'Code Contributor', description: 'Contribute code to open source projects', icon: <Code className="w-5 h-5" />, category: 'coding', xpReward: 300, tier: 1, progress: 12, maxProgress: 10, isUnlocked: true, unlockedDate: '2026-05-01', reward: 'Bronze Code Shield' },
  { id: 'a2', title: 'Code Contributor II', description: 'Contribute to 25 open source projects', icon: <Code className="w-5 h-5" />, category: 'coding', xpReward: 600, tier: 2, progress: 12, maxProgress: 25, isUnlocked: false, reward: 'Silver Code Shield' },
  { id: 'a3', title: 'Code Contributor III', description: 'Contribute to 50 open source projects', icon: <Code className="w-5 h-5" />, category: 'coding', xpReward: 1200, tier: 3, progress: 12, maxProgress: 50, isUnlocked: false, reward: 'Gold Code Shield' },
  { id: 'a4', title: 'Knowledge Seeker', description: 'Complete 20 learning modules', icon: <BookOpen className="w-5 h-5" />, category: 'learning', xpReward: 250, tier: 1, progress: 18, maxProgress: 20, isUnlocked: false, reward: 'Knowledge Crown' },
  { id: 'a5', title: 'Knowledge Master', description: 'Complete 50 learning modules', icon: <BookOpen className="w-5 h-5" />, category: 'learning', xpReward: 500, tier: 2, progress: 18, maxProgress: 50, isUnlocked: false, reward: 'Master Scroll' },
  { id: 'a6', title: 'Community Builder', description: 'Help 20 community members', icon: <Users className="w-5 h-5" />, category: 'social', xpReward: 350, tier: 1, progress: 15, maxProgress: 20, isUnlocked: false, reward: 'Community Badge' },
  { id: 'a7', title: 'Streak Lord', description: 'Maintain a 60-day streak', icon: <Flame className="w-5 h-5" />, category: 'streak', xpReward: 800, tier: 2, progress: 45, maxProgress: 60, isUnlocked: false, reward: 'Phoenix Feather' },
  { id: 'a8', title: 'Challenge Crusher', description: 'Complete 15 weekly challenges', icon: <Target className="w-5 h-5" />, category: 'challenge', xpReward: 400, tier: 1, progress: 9, maxProgress: 15, isUnlocked: false, reward: 'Challenge Amulet' },
  { id: 'a9', title: 'Star Performer', description: 'Reach the top 10 on the leaderboard', icon: <Star className="w-5 h-5" />, category: 'special', xpReward: 1000, tier: 1, progress: 1, maxProgress: 1, isUnlocked: true, unlockedDate: '2026-08-01', reward: 'Golden Star' },
  { id: 'a10', title: 'Team Player', description: 'Collaborate on 10 team projects', icon: <Heart className="w-5 h-5" />, category: 'social', xpReward: 300, tier: 1, progress: 7, maxProgress: 10, isUnlocked: false, reward: 'Team Medallion' },
  { id: 'a11', title: 'AI Enthusiast', description: 'Complete 5 AI/ML learning paths', icon: <Brain className="w-5 h-5" />, category: 'learning', xpReward: 600, tier: 1, progress: 2, maxProgress: 5, isUnlocked: false, reward: 'Neural Crown' },
  { id: 'a12', title: 'Bug Hunter Elite', description: 'Fix 50 bugs across projects', icon: <Crosshair className="w-5 h-5" />, category: 'coding', xpReward: 500, tier: 2, progress: 28, maxProgress: 50, isUnlocked: false, reward: 'Hunter Bow' },
];

const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  { id: 'wc1', title: 'Code 7 Days Straight', description: 'Commit code every day this week', icon: <Flame className="w-5 h-5" />, category: 'streak', status: 'active', xpReward: 200, progress: 4, maxProgress: 7, startDate: '2026-08-25', endDate: '2026-08-31', participants: 1234, difficulty: 'medium' },
  { id: 'wc2', title: 'Solve 5 DSA Problems', description: 'Complete 5 algorithm challenges', icon: <Target className="w-5 h-5" />, category: 'challenge', status: 'active', xpReward: 150, progress: 3, maxProgress: 5, startDate: '2026-08-25', endDate: '2026-08-31', participants: 2456, difficulty: 'easy' },
  { id: 'wc3', title: 'Review 3 PRs', description: 'Review pull requests in open source', icon: <Eye className="w-5 h-5" />, category: 'community', status: 'active', xpReward: 180, progress: 1, maxProgress: 3, startDate: '2026-08-25', endDate: '2026-08-31', participants: 876, difficulty: 'medium' },
  { id: 'wc4', title: 'Learn a New Framework', description: 'Complete a framework tutorial end-to-end', icon: <Rocket className="w-5 h-5" />, category: 'learning', status: 'active', xpReward: 250, progress: 0, maxProgress: 1, startDate: '2026-08-25', endDate: '2026-08-31', participants: 1567, difficulty: 'hard' },
  { id: 'wc5', title: 'Write a Tech Blog', description: 'Publish a technical blog post', icon: <BookOpen className="w-5 h-5" />, category: 'social', status: 'upcoming', xpReward: 200, progress: 0, maxProgress: 1, startDate: '2026-09-01', endDate: '2026-09-07', participants: 0, difficulty: 'medium' },
  { id: 'wc6', title: 'Contribute to Open Source', description: 'Submit 2 pull requests to OSS', icon: <GitBranch className="w-5 h-5" />, category: 'coding', status: 'upcoming', xpReward: 300, progress: 0, maxProgress: 2, startDate: '2026-09-01', endDate: '2026-09-07', participants: 0, difficulty: 'hard' },
  { id: 'wc7', title: 'Deploy a Project', description: 'Deploy a project to production', icon: <Compass className="w-5 h-5" />, category: 'coding', status: 'completed', xpReward: 250, progress: 1, maxProgress: 1, startDate: '2026-08-18', endDate: '2026-08-24', participants: 987, difficulty: 'hard' },
  { id: 'wc8', title: 'Help 5 People', description: 'Answer 5 community questions', icon: <MessageCircle className="w-5 h-5" />, category: 'community', status: 'completed', xpReward: 150, progress: 5, maxProgress: 5, startDate: '2026-08-18', endDate: '2026-08-24', participants: 1345, difficulty: 'easy' },
];

const STREAK: StreakInfo = {
  currentStreak: 45,
  longestStreak: 67,
  totalDays: 182,
  weeklyData: [
    { day: 'Mon', active: true, hours: 2.5 },
    { day: 'Tue', active: true, hours: 1.8 },
    { day: 'Wed', active: true, hours: 3.2 },
    { day: 'Thu', active: true, hours: 2.0 },
    { day: 'Fri', active: true, hours: 4.1 },
    { day: 'Sat', active: true, hours: 1.5 },
    { day: 'Sun', active: false, hours: 0 },
  ],
  monthlyActive: 24,
};

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Arjun Mehta', avatar: 'AM', xp: 28450, level: 42, badges: 18, streak: 89, isCurrentUser: false, change: 2 },
  { rank: 2, name: 'Priya Sharma', avatar: 'PS', xp: 26800, level: 40, badges: 16, streak: 72, isCurrentUser: false, change: -1 },
  { rank: 3, name: 'You', avatar: 'ME', xp: 24200, level: 38, badges: 14, streak: 45, isCurrentUser: true, change: 1 },
  { rank: 4, name: 'Vikram Patel', avatar: 'VP', xp: 22100, level: 36, badges: 13, streak: 34, isCurrentUser: false, change: -2 },
  { rank: 5, name: 'Ananya Roy', avatar: 'AR', xp: 21500, level: 35, badges: 12, streak: 56, isCurrentUser: false, change: 3 },
  { rank: 6, name: 'Rohan Gupta', avatar: 'RG', xp: 19800, level: 33, badges: 11, streak: 28, isCurrentUser: false, change: 0 },
  { rank: 7, name: 'Sneha Iyer', avatar: 'SI', xp: 18200, level: 31, badges: 10, streak: 41, isCurrentUser: false, change: 1 },
  { rank: 8, name: 'Karan Singh', avatar: 'KS', xp: 16900, level: 29, badges: 9, streak: 19, isCurrentUser: false, change: -1 },
  { rank: 9, name: 'Meera Kumar', avatar: 'MK', xp: 15400, level: 27, badges: 8, streak: 63, isCurrentUser: false, change: 4 },
  { rank: 10, name: 'Aditya Nair', avatar: 'AN', xp: 14200, level: 25, badges: 7, streak: 22, isCurrentUser: false, change: -3 },
];

const STATS: GamificationStats = {
  totalXP: 24200,
  level: 38,
  xpToNext: 800,
  totalBadges: 24,
  earnedBadges: 14,
  totalAchievements: 12,
  unlockedAchievements: 2,
  challengesCompleted: 9,
  weeklyXP: 1850,
  monthlyXP: 6200,
};

const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bg: string; border: string }> = {
  common: { label: 'Common', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
  uncommon: { label: 'Uncommon', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  rare: { label: 'Rare', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  epic: { label: 'Epic', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  legendary: { label: 'Legendary', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};

const CATEGORY_CONFIG: Record<AchievementCategory, { label: string; color: string; icon: React.ReactNode }> = {
  coding: { label: 'Coding', color: 'text-blue-400 bg-blue-500/20', icon: <Code className="w-3 h-3" /> },
  learning: { label: 'Learning', color: 'text-purple-400 bg-purple-500/20', icon: <BookOpen className="w-3 h-3" /> },
  community: { label: 'Community', color: 'text-emerald-400 bg-emerald-500/20', icon: <Users className="w-3 h-3" /> },
  streak: { label: 'Streak', color: 'text-amber-400 bg-amber-500/20', icon: <Flame className="w-3 h-3" /> },
  social: { label: 'Social', color: 'text-pink-400 bg-pink-500/20', icon: <Heart className="w-3 h-3" /> },
  challenge: { label: 'Challenge', color: 'text-red-400 bg-red-500/20', icon: <Target className="w-3 h-3" /> },
  special: { label: 'Special', color: 'text-amber-400 bg-amber-500/20', icon: <Star className="w-3 h-3" /> },
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'text-emerald-400 bg-emerald-500/20' },
  medium: { label: 'Medium', color: 'text-amber-400 bg-amber-500/20' },
  hard: { label: 'Hard', color: 'text-red-400 bg-red-500/20' },
};

// ─── Main Component ───────────────────────────────────────────────
export default function AchievementCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'achievements' | 'challenges' | 'leaderboard'>('overview');
  const [filterRarity, setFilterRarity] = useState<Rarity | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<AchievementCategory | 'all'>('all');
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);

  const earnedBadges = BADGES.filter(b => b.isEarned);
  const lockedBadges = BADGES.filter(b => !b.isEarned);
  const activeChallenges = WEEKLY_CHALLENGES.filter(c => c.status === 'active');
  const completedChallenges = WEEKLY_CHALLENGES.filter(c => c.status === 'completed');

  const filteredBadges = useMemo(() => {
    let badges = [...BADGES];
    if (filterRarity !== 'all') badges = badges.filter(b => b.rarity === filterRarity);
    if (filterCategory !== 'all') badges = badges.filter(b => b.category === filterCategory);
    if (showEarnedOnly) badges = badges.filter(b => b.isEarned);
    return badges;
  }, [filterRarity, filterCategory, showEarnedOnly]);

  const xpProgress = ((STATS.totalXP % 1000) / 1000) * 100;

  // ─── Tab: Overview ──────────────────────────────────────────────
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Level Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-amber-500/30">
              {STATS.level}
            </div>
            <div>
              <div className="text-white font-bold text-xl">Level {STATS.level}</div>
              <div className="text-gray-400 text-sm">{STATS.totalXP.toLocaleString()} XP · {STATS.xpToNext} XP to Level {STATS.level + 1}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-amber-400 text-3xl font-bold">🔥 {STREAK.currentStreak}</div>
            <div className="text-gray-400 text-xs">Day Streak</div>
          </div>
        </div>
        <div className="h-3 bg-surface/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000" style={{ width: `${xpProgress}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>Level {STATS.level}</span>
          <span>{Math.round(xpProgress)}% to Level {STATS.level + 1}</span>
          <span>Level {STATS.level + 1}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Badges Earned', value: `${STATS.earnedBadges}/${STATS.totalBadges}`, icon: <Award className="w-5 h-5" />, color: 'text-amber-400' },
          { label: 'Achievements', value: `${STATS.unlockedAchievements}/${STATS.totalAchievements}`, icon: <Trophy className="w-5 h-5" />, color: 'text-purple-400' },
          { label: 'Challenges Done', value: STATS.challengesCompleted, icon: <Target className="w-5 h-5" />, color: 'text-cyan-400' },
          { label: 'Weekly XP', value: STATS.weeklyXP.toLocaleString(), icon: <Zap className="w-5 h-5" />, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
            <div className={`p-2 rounded-xl bg-surface/5 ${stat.color} mb-3 inline-block`}>{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Streak Calendar */}
      <div className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" /> This Week's Activity
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {STREAK.weeklyData.map((day, i) => (
            <div key={i} className="text-center">
              <div className="text-[10px] text-gray-500 mb-2">{day.day}</div>
              <div className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                day.active ? 'bg-amber-500/30 border border-amber-500/50' : 'bg-surface/5 border border-white/10'
              }`}>
                {day.active ? (
                  <div className="text-center">
                    <Flame className="w-5 h-5 text-amber-400 mx-auto" />
                    <div className="text-[9px] text-amber-300 mt-0.5">{day.hours}h</div>
                  </div>
                ) : (
                  <div className="text-gray-600 text-xs">—</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400">
          <span>🔥 Current: {STREAK.currentStreak} days</span>
          <span>🏆 Longest: {STREAK.longestStreak} days</span>
          <span>📊 Total: {STREAK.totalDays} days</span>
          <span>📅 Active this month: {STREAK.monthlyActive} days</span>
        </div>
      </div>

      {/* Recent Badges */}
      <div>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> Recent Badges
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {earnedBadges.slice(-6).reverse().map(badge => {
            const rarity = RARITY_CONFIG[badge.rarity];
            return (
              <div key={badge.id} className={`flex-shrink-0 w-32 p-4 rounded-2xl text-center border ${rarity.bg} ${rarity.border} transition-all hover:scale-105`}>
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="text-white text-xs font-medium">{badge.name}</div>
                <div className={`text-[9px] mt-1 ${rarity.color}`}>{rarity.label}</div>
                <div className="text-[9px] text-gray-500 mt-1">{badge.earnedDate}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Challenges Preview */}
      <div>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" /> Active Challenges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeChallenges.slice(0, 4).map(challenge => {
            const pct = Math.round((challenge.progress / challenge.maxProgress) * 100);
            return (
              <div key={challenge.id} className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">{challenge.icon}</div>
                    <div>
                      <div className="text-white font-medium text-sm">{challenge.title}</div>
                      <div className="text-gray-500 text-[10px]">{challenge.participants} participants</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${DIFFICULTY_CONFIG[challenge.difficulty].color}`}>{challenge.difficulty}</span>
                </div>
                <div className="h-2 bg-surface/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>{challenge.progress}/{challenge.maxProgress}</span>
                  <span>+{challenge.xpReward} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 3 Leaderboard Preview */}
      <div>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" /> Top Performers
        </h3>
        <div className="flex gap-4 justify-center">
          {[1, 0, 2].map((idx) => {
            const entry = LEADERBOARD[idx];
            if (!entry) return null;
            const isFirst = idx === 0;
            return (
              <div key={entry.rank} className={`text-center ${isFirst ? 'mt-0' : 'mt-6'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2 ${
                  isFirst ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30' :
                  entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                  'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                }`}>
                  {entry.avatar}
                </div>
                <div className="text-white text-xs font-medium">{entry.name}</div>
                <div className="text-amber-400 text-[10px]">{entry.xp.toLocaleString()} XP</div>
                {isFirst && <div className="text-amber-400 mt-1">👑</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ─── Tab: Badges ────────────────────────────────────────────────
  const BadgesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <select value={filterRarity} onChange={e => setFilterRarity(e.target.value as Rarity | 'all')}
            className="bg-surface/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
            <option value="all">All Rarities</option>
            {Object.entries(RARITY_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as AchievementCategory | 'all')}
            className="bg-surface/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <button onClick={() => setShowEarnedOnly(!showEarnedOnly)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
              showEarnedOnly ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-surface/5 border-white/10 text-gray-400'
            }`}>
            {showEarnedOnly ? '✓ Earned Only' : 'Show All'}
          </button>
        </div>
        <span className="text-gray-400 text-sm">{filteredBadges.length} badges</span>
      </div>

      {/* Rarity Summary */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(RARITY_CONFIG).map(([key, val]) => {
          const count = BADGES.filter(b => b.rarity === key && b.isEarned).length;
          const total = BADGES.filter(b => b.rarity === key).length;
          return (
            <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${val.bg} ${val.border}`}>
              <span className={`text-xs font-medium ${val.color}`}>{val.label}</span>
              <span className="text-[10px] text-gray-400">{count}/{total}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBadges.map((badge, i) => {
          const rarity = RARITY_CONFIG[badge.rarity];
          const cat = CATEGORY_CONFIG[badge.category];
          return (
            <div key={badge.id}
              className={`rounded-2xl p-5 border transition-all hover:scale-[1.02] ${
                badge.isEarned ? `${rarity.bg} ${rarity.border}` : 'bg-surface/5 border-white/10 opacity-60'
              }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-4xl">{badge.icon}</div>
                {badge.isEarned ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : badge.progress !== undefined ? (
                  <span className="text-[10px] text-gray-400">{badge.progress}/{badge.maxProgress}</span>
                ) : (
                  <Lock className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <div className="text-white font-semibold text-sm mb-1">{badge.name}</div>
              <div className="text-gray-400 text-[10px] mb-2">{badge.description}</div>
              {badge.progress !== undefined && !badge.isEarned && (
                <div className="h-1.5 bg-surface/10 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(badge.progress / badge.maxProgress!) * 100}%` }} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold ${rarity.color}`}>{rarity.label}</span>
                <span className="text-[10px] text-amber-400">+{badge.xpReward} XP</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span className={`px-2 py-0.5 rounded text-[8px] ${cat.color}`}>{cat.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── Tab: Achievements ──────────────────────────────────────────
  const AchievementsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACHIEVEMENTS.map((achievement, i) => {
          const pct = Math.round((achievement.progress / achievement.maxProgress) * 100);
          const cat = CATEGORY_CONFIG[achievement.category];
          return (
            <div key={achievement.id}
              className={`bg-surface/5 backdrop-blur-md border rounded-2xl p-5 transition-all ${
                achievement.isUnlocked ? "border-amber-500/30 bg-amber-500/5" : "border-white/10 hover:border-white/20"
              }`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  achievement.isUnlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-surface/5 text-gray-500'
                }`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-white font-semibold text-sm">{achievement.title}</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface/10 text-gray-400">Tier {achievement.tier}</span>
                    {achievement.isUnlocked && <BadgeCheck className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="text-gray-400 text-[10px] mb-2">{achievement.description}</div>
                  <div className="h-2 bg-surface/10 rounded-full overflow-hidden mb-1">
                    <div className={`h-full rounded-full ${achievement.isUnlocked ? 'bg-amber-500' : 'bg-cyan-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                    <span className="text-amber-400">Reward: {achievement.reward}</span>
                  </div>
                  {achievement.isUnlocked && achievement.unlockedDate && (
                    <div className="text-[10px] text-amber-400 mt-1">✓ Unlocked {achievement.unlockedDate}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-amber-400 text-sm font-bold">+{achievement.xpReward}</div>
                  <div className="text-[9px] text-gray-500">XP</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── Tab: Challenges ────────────────────────────────────────────
  const ChallengesTab = () => (
    <div className="space-y-6">
      {activeChallenges.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" /> Active This Week
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeChallenges.map(challenge => {
              const pct = Math.round((challenge.progress / challenge.maxProgress) * 100);
              const diff = DIFFICULTY_CONFIG[challenge.difficulty];
              const cat = CATEGORY_CONFIG[challenge.category];
              return (
                <div key={challenge.id} className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">{challenge.icon}</div>
                      <div>
                        <div className="text-white font-semibold">{challenge.title}</div>
                        <div className="text-gray-400 text-[10px]">{challenge.description}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-bold ${diff.color}`}>{diff.label}</span>
                  </div>
                  <div className="h-3 bg-surface/10 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>{challenge.progress}/{challenge.maxProgress} completed</span>
                    <span>{pct}%</span>
                    <span className="text-amber-400 font-medium">+{challenge.xpReward} XP</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span className={`px-2 py-0.5 rounded ${cat.color}`}>{cat.label}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{challenge.participants.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">Ends {challenge.endDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {completedChallenges.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" /> Recently Completed
          </h3>
          <div className="space-y-3">
            {completedChallenges.map(challenge => (
              <div key={challenge.id} className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">{challenge.icon}</div>
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">{challenge.title}</div>
                  <div className="text-gray-400 text-[10px]">{challenge.participants} participants · {challenge.startDate} to {challenge.endDate}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 text-sm font-bold">✓ Completed</div>
                  <div className="text-[10px] text-amber-400">+{challenge.xpReward} XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {WEEKLY_CHALLENGES.filter(c => c.status === 'upcoming').length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" /> Coming Next Week
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WEEKLY_CHALLENGES.filter(c => c.status === 'upcoming').map(challenge => (
              <div key={challenge.id} className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">{challenge.icon}</div>
                  <div>
                    <div className="text-white font-medium text-sm">{challenge.title}</div>
                    <div className="text-gray-400 text-[10px]">Starts {challenge.startDate}</div>
                  </div>
                </div>
                <div className="text-gray-400 text-xs">{challenge.description}</div>
                <div className="flex items-center justify-between mt-2 text-[10px]">
                  <span className="text-amber-400">+{challenge.xpReward} XP</span>
                  <span className={`px-2 py-0.5 rounded ${DIFFICULTY_CONFIG[challenge.difficulty].color}`}>{DIFFICULTY_CONFIG[challenge.difficulty].label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ─── Tab: Leaderboard ───────────────────────────────────────────
  const LeaderboardTab = () => (
    <div className="space-y-6">
      <div className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[60px_1fr_100px_80px_80px_80px] gap-4 px-6 py-3 border-b border-white/10 text-[10px] text-gray-500 uppercase tracking-wider font-medium">
          <span>Rank</span>
          <span>Player</span>
          <span className="text-right">XP</span>
          <span className="text-center">Level</span>
          <span className="text-center">Badges</span>
          <span className="text-center">Streak</span>
        </div>
        {/* Entries */}
        {LEADERBOARD.map((entry, i) => (
          <div key={entry.rank}
            className={`grid grid-cols-[60px_1fr_100px_80px_80px_80px] gap-4 px-6 py-4 items-center border-b border-white/5 hover:bg-surface/5 transition-all ${
              entry.isCurrentUser ? 'bg-cyan-500/5 border-l-2 border-l-cyan-500' : ''
            }`}>
            <div className="flex items-center gap-2">
              {entry.rank <= 3 ? (
                <span className="text-lg">{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}</span>
              ) : (
                <span className="text-gray-400 text-sm font-medium w-6 text-center">#{entry.rank}</span>
              )}
              {entry.change > 0 && <span className="text-[9px] text-emerald-400">▲{entry.change}</span>}
              {entry.change < 0 && <span className="text-[9px] text-red-400">▼{Math.abs(entry.change)}</span>}
              {entry.change === 0 && <span className="text-[9px] text-gray-500">—</span>}
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                entry.isCurrentUser ? 'bg-cyan-500/30 text-cyan-400 ring-1 ring-cyan-500/50' :
                entry.rank <= 3 ? 'bg-amber-500/20 text-amber-400' : 'bg-surface/10 text-gray-300'
              }`}>
                {entry.avatar}
              </div>
              <div>
                <div className={`text-sm font-medium ${entry.isCurrentUser ? 'text-cyan-400' : 'text-white'}`}>
                  {entry.name} {entry.isCurrentUser && <span className="text-[9px]">(You)</span>}
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-white font-medium">{entry.xp.toLocaleString()}</div>
            <div className="text-center">
              <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-400">Lv.{entry.level}</span>
            </div>
            <div className="text-center text-sm text-gray-300">{entry.badges}</div>
            <div className="text-center flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              <span className="text-sm text-amber-400">{entry.streak}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Your Stats */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" /> Your Stats vs Top 10
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface/5 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">#3</div>
            <div className="text-xs text-gray-400 mt-1">Your Rank</div>
          </div>
          <div className="bg-surface/5 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{STATS.totalXP.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">Total XP</div>
          </div>
          <div className="bg-surface/5 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{STATS.earnedBadges}</div>
            <div className="text-xs text-gray-400 mt-1">Badges</div>
          </div>
          <div className="bg-surface/5 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{STREAK.currentStreak}</div>
            <div className="text-xs text-gray-400 mt-1">Day Streak</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen  font-sans pb-16">
      {/* Top Banner Header - Brand Theme */}
      <div className="m-4 sm:m-6 bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                <Trophy className="w-3.5 h-3.5 text-indigo-400" /> Achievement Hub
              </span>
              <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30">
                Gamified Progression
              </span>
            </div>

            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Achievement <span className="text-primary-blue italic">Center</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Earn badges, complete coding challenges, participate in open-source tasks, and climb the developer leaderboard.
            </motion.p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full shadow-xs">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-4 border-primary-blue bg-background font-serif font-bold text-xs text-primary-blue">
              Lvl {STATS.level}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{STATS.totalXP.toLocaleString()} XP Total</div>
              <div className="text-xs font-extrabold text-white">{STATS.earnedBadges} Badges Earned</div>
              <div className="text-[11px] text-emerald-400 font-semibold">{STREAK.currentStreak} Day Streak 🔥</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/10 pb-3">
          {[
            { id: 'overview' as const, label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'badges' as const, label: 'Badges', icon: <Award className="w-4 h-4" />, count: STATS.earnedBadges },
            { id: 'achievements' as const, label: 'Achievements', icon: <Trophy className="w-4 h-4" />, count: STATS.unlockedAchievements },
            { id: 'challenges' as const, label: 'Challenges', icon: <Target className="w-4 h-4" />, count: activeChallenges.length },
            { id: 'leaderboard' as const, label: 'Leaderboard', icon: <Crown className="w-4 h-4" /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? "bg-primary-blue text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-surface/5"
              }`}>
              {tab.icon}{tab.label}
              {tab.count !== undefined && <span className="text-xs opacity-60">({tab.count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "badges" && <BadgesTab />}
            {activeTab === "achievements" && <AchievementsTab />}
            {activeTab === "challenges" && <ChallengesTab />}
            {activeTab === "leaderboard" && <LeaderboardTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

import { AnimatePresence, motion } from 'framer-motion';

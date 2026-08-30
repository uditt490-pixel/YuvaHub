import React, { useState, useMemo } from 'react';
import {
  Swords, Trophy, Flame, Target, Clock, CheckCircle, XCircle, Star,
  ChevronRight, Filter, Search, TrendingUp, Award, Zap, Medal,
  Code, Brain, BarChart3, Users, Lock, Crown, Shield, ArrowRight,
  Calendar, Hash, Bookmark, Lightbulb, Rocket, Timer
} from 'lucide-react';

// ─── Data ──────────────────────────────────────────────────────────

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', color: '#10B981', bg: '#10B98115', points: 10 },
  { id: 'medium', label: 'Medium', color: '#F59E0B', bg: '#F59E0B15', points: 25 },
  { id: 'hard', label: 'Hard', color: '#EF4444', bg: '#EF444415', points: 50 },
  { id: 'expert', label: 'Expert', color: '#8B5CF6', bg: '#8B5CF615', points: 100 },
];

const CATEGORIES = [
  { id: 'algorithms', label: 'Algorithms', icon: Brain, count: 142 },
  { id: 'data-structures', label: 'Data Structures', icon: Code, count: 98 },
  { id: 'strings', label: 'Strings', icon: Hash, count: 67 },
  { id: 'dynamic-programming', label: 'Dynamic Programming', icon: TrendingUp, count: 84 },
  { id: 'graphs', label: 'Graphs', icon: BarChart3, count: 56 },
  { id: 'sorting', label: 'Sorting & Searching', icon: Target, count: 73 },
  { id: 'math', label: 'Math & Geometry', icon: Lightbulb, count: 45 },
  { id: 'system-design', label: 'System Design', icon: Rocket, count: 32 },
];

const CHALLENGES = [
  {
    id: 'c1', title: 'Two Sum Optimizer', difficulty: 'easy', category: 'algorithms',
    description: 'Given an array of integers and a target, find two numbers that add up to the target. Optimize for O(n) time.',
    timeLimit: 30, participants: 1247, solves: 892, acceptanceRate: 71.5,
    tags: ['Arrays', 'Hash Map'],
    testCases: 12, points: 10,
    starterCode: `function twoSum(nums, target) {\n  // Your solution here\n}`,
  },
  {
    id: 'c2', title: 'LinkedList Reversal', difficulty: 'easy', category: 'data-structures',
    description: 'Reverse a singly linked list iteratively and recursively. Handle edge cases for empty and single-node lists.',
    timeLimit: 25, participants: 983, solves: 654, acceptanceRate: 66.5,
    tags: ['Linked List', 'Recursion'],
    testCases: 10, points: 10,
    starterCode: `function reverseList(head) {\n  // Your solution here\n}`,
  },
  {
    id: 'c3', title: 'Longest Substring Without Repeats', difficulty: 'medium', category: 'strings',
    description: 'Find the length of the longest substring without repeating characters using the sliding window technique.',
    timeLimit: 35, participants: 876, solves: 412, acceptanceRate: 47.0,
    tags: ['Sliding Window', 'Hash Set'],
    testCases: 15, points: 25,
    starterCode: `function lengthOfLongestSubstring(s) {\n  // Your solution here\n}`,
  },
  {
    id: 'c4', title: 'Binary Tree Level Traversal', difficulty: 'medium', category: 'data-structures',
    description: 'Implement level-order traversal of a binary tree returning values grouped by depth level.',
    timeLimit: 30, participants: 754, solves: 398, acceptanceRate: 52.8,
    tags: ['BFS', 'Tree'],
    testCases: 14, points: 25,
    starterCode: `function levelOrder(root) {\n  // Your solution here\n}`,
  },
  {
    id: 'c5', title: 'Edit Distance DP', difficulty: 'hard', category: 'dynamic-programming',
    description: 'Compute the minimum edit distance between two strings using dynamic programming with space optimization.',
    timeLimit: 45, participants: 543, solves: 187, acceptanceRate: 34.4,
    tags: ['DP', 'String Manipulation'],
    testCases: 18, points: 50,
    starterCode: `function editDistance(word1, word2) {\n  // Your solution here\n}`,
  },
  {
    id: 'c6', title: 'Course Schedule Topological Sort', difficulty: 'hard', category: 'graphs',
    description: 'Determine if all courses can be finished given prerequisites using topological sorting on a DAG.',
    timeLimit: 40, participants: 432, solves: 156, acceptanceRate: 36.1,
    tags: ['Topological Sort', 'DFS', 'Graph'],
    testCases: 16, points: 50,
    starterCode: `function canFinish(numCourses, prerequisites) {\n  // Your solution here\n}`,
  },
  {
    id: 'c7', title: 'Median of Two Sorted Arrays', difficulty: 'expert', category: 'algorithms',
    description: 'Find the median of two sorted arrays in O(log(min(m,n))) time using binary search.',
    timeLimit: 60, participants: 321, solves: 67, acceptanceRate: 20.9,
    tags: ['Binary Search', 'Divide & Conquer'],
    testCases: 20, points: 100,
    starterCode: `function findMedianSortedArrays(nums1, nums2) {\n  // Your solution here\n}`,
  },
  {
    id: 'c8', title: 'LRU Cache Implementation', difficulty: 'expert', category: 'data-structures',
    description: 'Implement an LRU Cache with O(1) get and put operations using a hash map and doubly linked list.',
    timeLimit: 50, participants: 287, solves: 89, acceptanceRate: 31.0,
    tags: ['Design', 'Hash Map', 'Linked List'],
    testCases: 16, points: 100,
    starterCode: `class LRUCache {\n  constructor(capacity) {}\n  get(key) {}\n  put(key, value) {}\n}`,
  },
  {
    id: 'c9', title: 'Merge K Sorted Lists', difficulty: 'hard', category: 'data-structures',
    description: 'Merge k sorted linked lists into one sorted list using a min-heap approach.',
    timeLimit: 40, participants: 398, solves: 145, acceptanceRate: 36.4,
    tags: ['Heap', 'Linked List', 'Divide & Conquer'],
    testCases: 14, points: 50,
    starterCode: `function mergeKLists(lists) {\n  // Your solution here\n}`,
  },
  {
    id: 'c10', title: 'Rate Limiter Design', difficulty: 'medium', category: 'system-design',
    description: 'Design a distributed rate limiter using sliding window algorithm with Redis-compatible storage.',
    timeLimit: 35, participants: 567, solves: 234, acceptanceRate: 41.3,
    tags: ['Design', 'Sliding Window', 'Distributed'],
    testCases: 12, points: 25,
    starterCode: `class RateLimiter {\n  constructor(windowMs, maxRequests) {}\n  isAllowed(userId) {}\n}`,
  },
  {
    id: 'c11', title: 'Serialize Binary Tree', difficulty: 'medium', category: 'data-structures',
    description: 'Design an algorithm to serialize and deserialize a binary tree to/from a string.',
    timeLimit: 35, participants: 654, solves: 312, acceptanceRate: 47.7,
    tags: ['Tree', 'BFS', 'Design'],
    testCases: 14, points: 25,
    starterCode: `function serialize(root) {}\nfunction deserialize(data) {}`,
  },
  {
    id: 'c12', title: 'Word Break II', difficulty: 'hard', category: 'dynamic-programming',
    description: 'Given a dictionary, return all possible sentences from a string using dictionary words.',
    timeLimit: 45, participants: 378, solves: 112, acceptanceRate: 29.6,
    tags: ['DP', 'Backtracking', 'Trie'],
    testCases: 16, points: 50,
    starterCode: `function wordBreak(s, wordDict) {\n  // Your solution here\n}`,
  },
];

const LEADERBOARD = [
  { rank: 1, name: 'Alex Chen', avatar: '🧑‍💻', points: 4850, streak: 45, solved: 127, badge: 'crown' },
  { rank: 2, name: 'Priya Sharma', avatar: '👩‍💻', points: 4620, streak: 38, solved: 119, badge: 'medal' },
  { rank: 3, name: 'Marcus Johnson', avatar: '🧑‍🔬', points: 4380, streak: 32, solved: 112, badge: 'medal' },
  { rank: 4, name: 'Sofia Rodriguez', avatar: '👩‍🔬', points: 4150, streak: 28, solved: 105, badge: 'shield' },
  { rank: 5, name: 'Kim Tanaka', avatar: '🧑‍🎓', points: 3920, streak: 24, solved: 98, badge: 'shield' },
  { rank: 6, name: 'Anubhuti Sharma', avatar: '👩‍🎓', points: 3780, streak: 21, solved: 94, badge: 'star' },
  { rank: 7, name: 'David Park', avatar: '🧑‍🏫', points: 3650, streak: 19, solved: 91, badge: 'star' },
  { rank: 8, name: 'Emma Wilson', avatar: '👩‍🏫', points: 3420, streak: 15, solved: 85, badge: 'star' },
  { rank: 9, name: 'Raj Patel', avatar: '🧑‍💼', points: 3280, streak: 12, solved: 80, badge: 'fire' },
  { rank: 10, name: 'Lisa Wang', avatar: '👩‍💼', points: 3150, streak: 10, solved: 76, badge: 'fire' },
];

const USER_STATS = {
  name: 'You',
  points: 2450,
  streak: 14,
  solved: 67,
  rank: 23,
  totalSubmissions: 189,
  accuracy: 35.4,
  avgTime: '18m',
  currentTier: 'Gold',
  tierProgress: 72,
  easy: { solved: 32, total: 45 },
  medium: { solved: 24, total: 52 },
  hard: { solved: 9, total: 38 },
  expert: { solved: 2, total: 15 },
};

// ─── Helpers ───────────────────────────────────────────────────────

function getDifficultyMeta(id: string) {
  return DIFFICULTIES.find((d) => d.id === id) || DIFFICULTIES[0];
}

function getRankBadge(rank: number) {
  if (rank === 1) return { icon: Crown, color: '#F59E0B', label: 'Champion' };
  if (rank <= 3) return { icon: Medal, color: '#94A3B8', label: 'Top 3' };
  if (rank <= 5) return { icon: Shield, color: '#CD7F32', label: 'Top 5' };
  return { icon: Star, color: '#6B7280', label: `#${rank}` };
}

function getTierColor(tier: string) {
  const map: Record<string, string> = { Bronze: '#CD7F32', Silver: '#94A3B8', Gold: '#F59E0B', Platinum: '#06B6D4', Diamond: '#8B5CF6' };
  return map[tier] || '#6B7280';
}

// ─── Sub-Components ────────────────────────────────────────────────

/** Challenge card in the list view */
function ChallengeCard({ challenge, onSelect }: {
  challenge: typeof CHALLENGES[0];
  onSelect: () => void;
}) {
  const diff = getDifficultyMeta(challenge.difficulty);
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left p-4 rounded-xl border border-border-theme dark:border-slate-800/60 shadow-sm bg-surface dark:bg-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: diff.bg, color: diff.color }}>
            {diff.label}
          </span>
          <span className="text-xs text-gray-400">+{challenge.points} pts</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Timer size={12} />
          <span>{challenge.timeLimit}m</span>
        </div>
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{challenge.title}</h3>
      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{challenge.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {challenge.tags.map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Users size={10} />{challenge.participants}</span>
          <span className="flex items-center gap-1"><CheckCircle size={10} />{challenge.acceptanceRate}%</span>
        </div>
      </div>
    </button>
  );
}

/** Challenge detail / practice view */
function ChallengeDetail({ challenge, onBack }: {
  challenge: typeof CHALLENGES[0];
  onBack: () => void;
}) {
  const [code, setCode] = useState(challenge.starterCode);
  const [status, setStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle');
  const diff = getDifficultyMeta(challenge.difficulty);

  const handleRun = () => {
    setStatus('running');
    setTimeout(() => setStatus(Math.random() > 0.3 ? 'passed' : 'failed'), 1500);
  };

  return (
    <div>
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold mb-4">
        ← Back to challenges
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Problem */}
        <div className="space-y-4">
          <div className="bg-surface dark:bg-gray-800 rounded-xl p-5 border border-border-theme dark:border-slate-800/60 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: diff.bg, color: diff.color }}>{diff.label}</span>
              <span className="text-xs text-gray-400">+{challenge.points} pts</span>
              <span className="text-xs text-gray-400 ml-auto flex items-center gap-1"><Timer size={12} />{challenge.timeLimit} min</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{challenge.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{challenge.description}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {challenge.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">{tag}</span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="text-sm font-bold text-gray-900 dark:text-white">{challenge.participants}</div>
                <div className="text-[10px] text-gray-400">Participants</div>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="text-sm font-bold text-gray-900 dark:text-white">{challenge.solves}</div>
                <div className="text-[10px] text-gray-400">Solves</div>
              </div>
              <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="text-sm font-bold" style={{ color: challenge.acceptanceRate > 50 ? '#10B981' : '#EF4444' }}>{challenge.acceptanceRate}%</div>
                <div className="text-[10px] text-gray-400">Acceptance</div>
              </div>
            </div>
          </div>

          {/* Test Cases */}
          <div className="bg-surface dark:bg-gray-800 rounded-xl p-5 border border-border-theme dark:border-slate-800/60 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Test Cases</h3>
            <div className="space-y-2">
              {[1, 2, 3].map((tc) => (
                <div key={tc} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-xs font-mono text-gray-400">TC {tc}</span>
                  <div className="flex-1 font-mono text-xs text-gray-600 dark:text-gray-400">
                    Input: [{[2, 7, 11, 15].slice(0, tc + 1).join(', ')}], target: {tc === 1 ? '9' : tc === 2 ? '11' : '13'}
                  </div>
                  <span className="text-xs text-gray-400">→ [{tc}, {tc}]</span>
                </div>
              ))}
              <div className="text-xs text-gray-400 text-center pt-1">+ {challenge.testCases - 3} hidden test cases</div>
            </div>
          </div>
        </div>

        {/* Right: Code Editor */}
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-gray-400 ml-2">solution.js</span>
              </div>
              <span className="text-[10px] text-gray-500">JavaScript</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 p-4 bg-transparent text-green-400 font-mono text-sm resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRun}
              disabled={status === 'running'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50"
              style={{ background: status === 'running' ? '#6B7280' : '#2563EB' }}
            >
              {status === 'running' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running...
                </>
              ) : (
                <><Code size={16} /> Run & Submit</>
              )}
            </button>
          </div>

          {status === 'passed' && (
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
              <CheckCircle size={24} className="text-green-500" />
              <div>
                <div className="font-bold text-green-700 dark:text-green-400">All Test Cases Passed! 🎉</div>
                <div className="text-xs text-green-600 dark:text-green-500">+{challenge.points} points earned</div>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
              <XCircle size={24} className="text-red-500" />
              <div>
                <div className="font-bold text-red-700 dark:text-red-400">Some Test Cases Failed</div>
                <div className="text-xs text-red-600 dark:text-red-500">2/3 test cases passed — check your logic</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Leaderboard table */
function LeaderboardTable() {
  return (
    <div className="space-y-2">
      {LEADERBOARD.map((entry) => {
        const rankBadge = getRankBadge(entry.rank);
        const RankIcon = rankBadge.icon;
        return (
          <div
            key={entry.rank}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
              entry.name === 'Anubhuti Sharma'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                : 'border-border-theme dark:border-slate-800/60 bg-surface dark:bg-slate-900 hover:shadow-md'
            }`}
          >
            <div className="w-10 text-center">
              {entry.rank <= 3 ? (
                <RankIcon size={24} style={{ color: rankBadge.color }} />
              ) : (
                <span className="text-lg font-bold text-gray-400">#{entry.rank}</span>
              )}
            </div>
            <span className="text-2xl">{entry.avatar}</span>
            <div className="flex-1">
              <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {entry.name}
                {entry.name === 'Anubhuti Sharma' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">YOU</span>
                )}
              </div>
              <div className="text-xs text-gray-500">{entry.solved} problems solved</div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">{entry.points.toLocaleString()}</div>
                <div className="text-[10px] text-gray-400">points</div>
              </div>
              <div className="flex items-center gap-1">
                <Flame size={14} className="text-orange-500" />
                <span className="text-sm font-bold text-orange-500">{entry.streak}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** User stats panel */
function UserStatsPanel() {
  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  const tierColor = getTierColor(USER_STATS.currentTier);

  return (
    <div className="space-y-4">
      {/* Tier Progress */}
      <div className="bg-surface dark:bg-gray-800 rounded-xl p-5 border border-border-theme dark:border-slate-800/60 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white">Your Tier</h3>
          <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: `${tierColor}20`, color: tierColor }}>
            {USER_STATS.currentTier}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
          <div className="h-full rounded-full transition-all" style={{ width: `${USER_STATS.tierProgress}%`, background: tierColor }} />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400">
          {tiers.map((t) => (
            <span key={t} style={{ color: t === USER_STATS.currentTier ? tierColor : undefined }} className={t === USER_STATS.currentTier ? 'font-bold' : ''}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Trophy, label: 'Points', value: USER_STATS.points.toLocaleString(), color: '#F59E0B' },
          { icon: Flame, label: 'Day Streak', value: USER_STATS.streak, color: '#EF4444' },
          { icon: CheckCircle, label: 'Solved', value: USER_STATS.solved, color: '#10B981' },
          { icon: TrendingUp, label: 'Rank', value: `#${USER_STATS.rank}`, color: '#2563EB' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface dark:bg-gray-800 rounded-xl p-3 border border-border-theme dark:border-slate-800/60 shadow-sm text-center">
            <stat.icon size={18} className="mx-auto mb-1" style={{ color: stat.color }} />
            <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-[10px] text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Difficulty Breakdown */}
      <div className="bg-surface dark:bg-gray-800 rounded-xl p-5 border border-border-theme dark:border-slate-800/60 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Difficulty Breakdown</h3>
        <div className="space-y-3">
          {DIFFICULTIES.map((d) => {
            const stats = USER_STATS[d.id as keyof typeof USER_STATS] as { solved: number; total: number } | undefined;
            if (!stats || typeof stats !== 'object' || !('solved' in stats)) return null;
            const pct = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0;
            return (
              <div key={d.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: d.color }}>{d.label}</span>
                  <span className="text-gray-400">{stats.solved}/{stats.total} ({pct}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

/** Coding Challenge Arena — competitive coding challenges with leaderboard, streaks, and real-time ranking */
export default function CodingChallengeArena() {
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard' | 'stats'>('challenges');
  const [selectedChallenge, setSelectedChallenge] = useState<typeof CHALLENGES[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'acceptance' | 'newest'>('popular');

  const filteredChallenges = useMemo(() => {
    let list = CHALLENGES.filter((c) => {
      const matchSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchDiff = filterDifficulty === 'all' || c.difficulty === filterDifficulty;
      const matchCat = filterCategory === 'all' || c.category === filterCategory;
      return matchSearch && matchDiff && matchCat;
    });
    if (sortBy === 'popular') list.sort((a, b) => b.participants - a.participants);
    else if (sortBy === 'acceptance') list.sort((a, b) => b.acceptanceRate - a.acceptanceRate);
    return list;
  }, [searchQuery, filterDifficulty, filterCategory, sortBy]);

  if (selectedChallenge) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <ChallengeDetail challenge={selectedChallenge} onBack={() => setSelectedChallenge(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                  <Swords className="w-3.5 h-3.5 text-indigo-400" /> Competitive Coding
                </span>
                <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30">
                  Global Leaderboard Active
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
                Coding Challenge <span className="text-primary-blue italic">Arena</span>
              </h1>
              <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
                Sharpen your skills with competitive coding challenges, build your day streak, and climb the global ranking.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-surface dark:bg-gray-800 rounded-xl p-1 border border-border-theme dark:border-slate-800/60 shadow-sm">
          {([
            { id: 'challenges' as const, label: '⚡ Challenges', count: filteredChallenges.length },
            { id: 'leaderboard' as const, label: '🏆 Leaderboard' },
            { id: 'stats' as const, label: '📊 My Stats' },
          ]).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-blue-500 text-blue-100' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-theme dark:border-slate-800/60 shadow-sm bg-surface dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search..."
                />
              </div>

              <div className="bg-surface dark:bg-gray-800 rounded-xl p-4 border border-border-theme dark:border-slate-800/60 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Difficulty</h4>
                <div className="space-y-1">
                  {[{ id: 'all', label: 'All', color: '#6B7280' }, ...DIFFICULTIES].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setFilterDifficulty(d.id)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filterDifficulty === d.id ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-surface dark:bg-gray-800 rounded-xl p-4 border border-border-theme dark:border-slate-800/60 shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Category</h4>
                <div className="space-y-1">
                  {[{ id: 'all', label: 'All Categories', count: CHALLENGES.length }, ...CATEGORIES].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFilterCategory(c.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filterCategory === c.id ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <span>{c.label}</span>
                      <span className="text-gray-400">{c.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Challenge List */}
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{filteredChallenges.length} challenges</span>
                <div className="flex gap-2">
                  {(['popular', 'acceptance'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSortBy(s)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        sortBy === s ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {s === 'popular' ? '🔥 Popular' : '✅ Acceptance'}
                    </button>
                  ))}
                </div>
              </div>
              {filteredChallenges.map((c) => (
                <ChallengeCard key={c.id} challenge={c} onSelect={() => setSelectedChallenge(c)} />
              ))}
              {filteredChallenges.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <Code size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No challenges match your filters</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-3xl mx-auto">
            <LeaderboardTable />
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="max-w-md mx-auto">
            <UserStatsPanel />
          </div>
        )}
      </div>
    </div>
  );
}

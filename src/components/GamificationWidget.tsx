import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award } from 'lucide-react';

interface GamificationWidgetProps {
    userId: string;
    currentScore: number;
    level: number;
    badges: string[];
}

/**
 * GamificationWidget displays the user's current level, points to next level,
 * and unlocked badges. It uses Framer Motion for celebratory animations.
 */
export const GamificationWidget: React.FC<GamificationWidgetProps> = ({
    currentScore,
    level,
    badges,
}) => {
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [prevLevel, setPrevLevel] = useState(level);

    // Calculate points needed for next level
    // Formula inverse: score = (level - 1)^2 * 100
    const nextLevelScore = Math.pow(level, 2) * 100;
    const pointsToNext = Math.max(0, nextLevelScore - currentScore);
    const progressPercentage = Math.min(100, (currentScore / nextLevelScore) * 100);

    useEffect(() => {
        if (level > prevLevel) {
            setShowLevelUp(true);
            setPrevLevel(level);
            const timer = setTimeout(() => setShowLevelUp(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [level, prevLevel]);

    return (
        <div className="bg-surface dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-2 font-bold rounded-t-xl"
                    >
                        🎉 Level Up! You are now Level {level}! 🎉
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Level {level}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{currentScore} Total Points</p>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress to Level {level + 1}</span>
                    <span>{pointsToNext} pts needed</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <motion.div
                        className="bg-blue-600 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Badges Section */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <Award className="w-4 h-4 mr-2" /> Unlocked Badges
                </h4>
                <div className="flex flex-wrap gap-2">
                    {badges.length > 0 ? (
                        badges.map((badge, index) => (
                            <motion.span
                                key={badge}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full flex items-center"
                            >
                                <Star className="w-3 h-3 mr-1" /> {badge}
                            </motion.span>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Complete actions to earn badges!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import { Coins, Clock, CheckCircle, ChevronRight } from 'lucide-react';

interface Gig {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  posterId: string;
  createdAt: string;
}

interface GigListingCardProps {
  gig: Gig;
  onClick: () => void;
}

export const GigListingCard: React.FC<GigListingCardProps> = ({ gig, onClick }) => {
  return (
    <div 
      className="bg-surface dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
          {gig.title}
        </h3>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <Coins className="w-3.5 h-3.5" />
          {gig.rewardPoints} Pts
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
        {gig.description}
      </p>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          {gig.status === 'open' && <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"><CheckCircle className="w-3.5 h-3.5"/> Open</span>}
          {gig.status === 'in_progress' && <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400"><Clock className="w-3.5 h-3.5"/> In Progress</span>}
          {gig.status === 'completed' && <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500"><CheckCircle className="w-3.5 h-3.5"/> Completed</span>}
        </div>
        <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

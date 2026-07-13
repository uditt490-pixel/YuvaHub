import React, { useState, useEffect } from 'react';
import { Bookmark as BookmarkIcon } from 'lucide-react';
import { UserProfile } from '../../types';
import { fetchOpportunityById } from '../../services/apiClient';
import { AsyncState } from '../ui/states';

interface BookmarksProps {
  user: any;
  profile: UserProfile | null;
  onViewDetails: (id: string, title?: string) => void;
}

export default function Bookmarks({ user, profile, onViewDetails }: BookmarksProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBookmarks = async (isRetry = false) => {
    if (!profile?.bookmarks?.length) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    isRetry ? setRetrying(true) : setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        profile.bookmarks.map((id) => fetchOpportunityById(id)),
      );
      setItems(results.filter(Boolean));
    } catch {
      setError('Unable to load your bookmarks. Please try again.');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    void loadBookmarks();
  }, [profile?.bookmarks]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Your Bookmarks</h2>
        <p className="text-gray-500 mt-1">Review your saved opportunities and apply.</p>
      </header>

      <AsyncState
        loading={loading}
        error={error}
        empty={items.length === 0}
        onRetry={() => void loadBookmarks(true)}
        retrying={retrying}
        skeletonCount={4}
        emptyTitle="You have not bookmarked any opportunities"
        emptyDescription="Bookmark an opportunity to find it quickly later."
        emptyAction={<BookmarkIcon className="mx-auto h-8 w-8 text-gray-300" aria-hidden="true" />}
      >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <div key={i} className="clean-card p-6 flex flex-col justify-between relative group">
            <div className="flex justify-between items-start mb-2 pr-6">
              <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                {item.type || 'Opportunity'}
              </span>
            </div>
            <a 
              href={`/opportunity/${item.id}/${(item.title || "opportunity").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`}
              onClick={(e) => {
                e.preventDefault();
                onViewDetails(item.id, item.title);
              }}
              className="hover:text-blue-600 transition-colors block cursor-pointer"
            >
              <h4 className="font-bold text-gray-900 mb-1 leading-tight text-base sm:text-lg">{item.title}</h4>
            </a>
            <p className="text-sm text-gray-500 mb-3">{item.organization || item.org}</p>
            <p className="text-sm text-gray-700 line-clamp-2 mb-4">{item.description}</p>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                <div className="flex flex-wrap gap-2">
                  {item.tags?.slice(0,2).map((t: string) => (
                    <span key={t} className="text-[10px] bg-gray-100 px-2 py-1 text-gray-600 rounded">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {(item.apply_link || item.applyLink) ? (
                    <a 
                      href={item.apply_link || item.applyLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="clean-btn px-4 py-1.5 text-xs font-bold hover:shadow-md transition-shadow"
                    >
                      Apply
                    </a>
                  ) : (
                    <span className="text-[10px] font-semibold text-red-500">DL: {item.deadline || item.daysLeft + 'd'}</span>
                  )}
                </div>
            </div>
          </div>
        ))}
      </div>
      </AsyncState>
    </div>
  );
}

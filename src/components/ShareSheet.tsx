import React, { useState } from 'react';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityTitle: string;
  opportunityId: string;
}

export const ShareSheet: React.FC<ShareSheetProps> = ({
  isOpen,
  onClose,
  opportunityTitle,
  opportunityId,
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const generateLink = async (platform: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/referrals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId, platform }),
      });
      const data = await res.json();
      setLoading(false);
      return data.referralUrl;
    } catch (err) {
      setLoading(false);
      return `${window.location.origin}/opportunities/${opportunityId}`;
    }
  };

  const handleNativeShare = async () => {
    const url = await generateLink('native');
    if (navigator.share) {
      try {
        await navigator.share({
          title: opportunityTitle,
          text: `Check out this opportunity: ${opportunityTitle}`,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const handlePlatformShare = async (platform: string) => {
    const url = await generateLink(platform);
    const text = encodeURIComponent(`Check out ${opportunityTitle} on YuvaHub!`);
    const encodedUrl = encodeURIComponent(url);

    let shareUrl = '';
    if (platform === 'whatsapp') shareUrl = `https://api.whatsapp.com/send?text=${text}%20${encodedUrl}`;
    if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`;
    if (platform === 'linkedin') shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

    if (shareUrl) window.open(shareUrl, '_blank');
  };

  const handleCopyLink = async () => {
    const url = await generateLink('copy_link');
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold dark:text-white">Share Opportunity</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{opportunityTitle}</p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="col-span-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm"
            >
              Share via...
            </button>
          )}

          <button
            onClick={() => handlePlatformShare('whatsapp')}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm"
          >
            WhatsApp
          </button>
          <button
            onClick={() => handlePlatformShare('linkedin')}
            className="py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm"
          >
            LinkedIn
          </button>
          <button
            onClick={() => handlePlatformShare('twitter')}
            className="py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm"
          >
            Twitter / X
          </button>
          <button
            onClick={handleCopyLink}
            className="py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg text-sm"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
};

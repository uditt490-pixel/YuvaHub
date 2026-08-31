import React from 'react';

type Tier = 'none' | 'student' | 'organization' | 'manual_approved' | 'manual_pending';

interface BadgeProps {
  tier: Tier;
  isVerified: boolean;
}

export default function VerificationBadge({ tier, isVerified }: BadgeProps) {
  if (!isVerified && tier !== 'manual_pending') return null;

  const config = {
    student: { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', text: 'Verified Student' },
    organization: { color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', text: 'Verified Employer' },
    manual_approved: { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', text: 'Verified Partner' },
    manual_pending: { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', text: 'Verification Pending' }
  };

  const current = config[tier as keyof typeof config];
  if (!current) return null;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${current.color}`}>
      {tier !== 'manual_pending' && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a.75.75 0 00-.708.522L4.547 7.22H1.75a.75.75 0 000 1.5h3.197l.805 2.584a.75.75 0 001.416 0l1.196-3.836 1.111 3.565a.75.75 0 001.417.02l1.623-4.333 1.144 1.144a.75.75 0 001.06 0l2.25-2.25a.75.75 0 10-1.06-1.06L13.72 6.19l-1.328-1.328a.75.75 0 00-1.103.043l-1.461 1.948-1.037-3.322a.75.75 0 00-.712-.529z" clipRule="evenodd" />
        </svg>
      )}
      {current.text}
    </span>
  );
}

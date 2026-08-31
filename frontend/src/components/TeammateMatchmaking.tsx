'use client';

import React, { useState, useEffect } from 'react';

interface CandidateProfile {
  id: number;
  user_id: number;
  skills_have: string[];
  skills_needed: string[];
  experience_level: string;
}

interface MatchResponse {
  profile: CandidateProfile;
  score: number;
}

export default function TeammateMatchmaking({ hackathonId }: { hackathonId: number }) {
  const [candidates, setCandidates] = useState<MatchResponse[]>([]);
  const [invitedIds, setInvitedIds] = useState<number[]>([]);

  useEffect(() => {
    // Fetch matched potential matches from endpoint
    fetch(`/api/v1/hackathons/${hackathonId}/matches`)
      .then(res => res.json())
      .then(data => setCandidates(data));
  }, [hackathonId]);

  const sendTeamRequest = async (receiverId: number) => {
    // Inject lightweight invite pipeline loop
    setInvitedIds(prev => [...prev, receiverId]);
  };

  return (
    <div className="p-6 bg-zinc-900 rounded-xl text-white">
      <h3 className="text-xl font-bold mb-4">Suggested Teammates</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {candidates.map(({ profile, score }) => (
          <div key={profile.id} className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold px-2 py-1 bg-purple-500/10 text-purple-400 rounded">
                  {profile.experience_level}
                </span>
                <span className="text-xs text-zinc-500 font-mono">Match Score: {score}</span>
              </div>
              <div className="mb-2">
                <p className="text-xs text-zinc-400 font-medium">Offers:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.skills_have.map(s => <span key={s} className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded">{s}</span>)}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs text-zinc-400 font-medium">Needs:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.skills_needed.map(s => <span key={s} className="text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded">{s}</span>)}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => sendTeamRequest(profile.user_id)}
              disabled={invitedIds.includes(profile.user_id)}
              className={`w-full text-xs font-medium py-2 rounded transition-all ${
                invitedIds.includes(profile.user_id) 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {invitedIds.includes(profile.user_id) ? 'Request Sent' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

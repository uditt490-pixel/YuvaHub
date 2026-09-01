import React, { useState } from 'react';

export const MockInterviewHub: React.FC = () => {
  const [targetRole, setTargetRole] = useState('SDE');
  const [status, setStatus] = useState<'idle' | 'waiting' | 'matched'>('idle');

  const handleJoinQueue = () => {
    setStatus('waiting');
    console.log(`Joined queue for role: ${targetRole}`);
    
    setTimeout(() => {
      setStatus('matched');
    }, 3000);
  };

  const handleCancel = () => {
    setStatus('idle');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="w-full max-w-md bg-surface rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Mock Interview Matchmaking</h2>
          
          <div className="space-y-4">
            {status === 'idle' && (
              <>
                <p className="text-sm text-gray-600">
                  Select your target role and get matched with a peer for a real-time mock interview.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Role
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="SDE">Software Engineer (SDE)</option>
                    <option value="PM">Product Manager (PM)</option>
                    <option value="Data">Data Scientist</option>
                    <option value="Design">Product Designer</option>
                  </select>
                </div>
              </>
            )}

            {status === 'waiting' && (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-gray-600 font-medium">Looking for a match for {targetRole}...</p>
              </div>
            )}

            {status === 'matched' && (
              <div className="flex flex-col items-center justify-center space-y-4 py-8 text-green-600">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p className="font-bold text-lg">Match Found!</p>
                <p className="text-gray-600">Redirecting to collaborative workspace...</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
          {status === 'idle' && (
            <button 
              onClick={handleJoinQueue} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Find a Match
            </button>
          )}
          {status === 'waiting' && (
            <button 
              onClick={handleCancel} 
              className="w-full border border-gray-300 hover:bg-gray-100 font-medium py-2 px-4 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

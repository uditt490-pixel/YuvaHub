import React, { useState } from 'react';

export const FeedbackForm: React.FC<{ sessionId: string; onComplete: () => void }> = ({ sessionId, onComplete }) => {
  const [communicationScore, setCommunicationScore] = useState<number>(5);
  const [technicalScore, setTechnicalScore] = useState<number>(5);
  const [strengths, setStrengths] = useState('');
  const [areasToImprove, setAreasToImprove] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting feedback:', {
      sessionId,
      communicationScore,
      technicalScore,
      strengths,
      areasToImprove
    });
    onComplete();
  };

  return (
    <div className="max-w-2xl mx-auto w-full bg-surface rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold">Session Complete! Peer Feedback</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Communication Score (1-5)
            </label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={communicationScore}
              onChange={(e) => setCommunicationScore(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-center font-bold text-lg">{communicationScore} / 5</div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Technical Score (1-5)
            </label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={technicalScore}
              onChange={(e) => setTechnicalScore(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-center font-bold text-lg">{technicalScore} / 5</div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              What did your peer do well?
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="E.g., Clear explanation of the approach before coding..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Areas to improve
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
              value={areasToImprove}
              onChange={(e) => setAreasToImprove(e.target.value)}
              placeholder="E.g., Try to consider edge cases earlier in the process..."
              required
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  );
};

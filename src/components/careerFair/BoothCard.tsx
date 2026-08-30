import React, { useState } from 'react';
import { ICompanyBooth } from '../../models/virtualCareerFairSchema';
import { ResumeDropModal } from './ResumeDropModal';
import { LiveQueueManager } from './LiveQueueManager';

interface BoothCardProps {
  booth: ICompanyBooth;
}

export const BoothCard: React.FC<BoothCardProps> = ({ booth }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  return (
    <div className="bg-surface rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{booth.companyName}</h3>
          <span className="flex items-center text-sm font-medium text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
            <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full animate-pulse"></span>
            {booth.recruitersOnline} Online
          </span>
        </div>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">{booth.description}</p>
        
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Open Roles</h4>
          <div className="flex flex-wrap gap-2">
            {booth.openRoles.map((role, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col gap-3">
        <button 
          onClick={() => setIsQueueOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
        >
          Join Live Queue
        </button>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-surface hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 border border-gray-300 rounded-lg transition-colors shadow-sm"
        >
          Drop Resume
        </button>
      </div>

      {isModalOpen && (
        <ResumeDropModal 
          boothId={booth.id!} 
          companyName={booth.companyName} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

      {isQueueOpen && (
        <LiveQueueManager 
          boothId={booth.id!} 
          companyName={booth.companyName}
          onClose={() => setIsQueueOpen(false)}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { BoothCard } from './BoothCard';
import { ICompanyBooth } from '../../models/virtualCareerFairSchema';

const mockBooths: ICompanyBooth[] = [
  { id: '1', fairId: 'fair1', companyName: 'Google', description: 'Search and beyond', openRoles: ['Software Engineer', 'Product Manager'], recruitersOnline: 2 },
  { id: '2', fairId: 'fair1', companyName: 'Microsoft', description: 'Empower every person', openRoles: ['Frontend Developer', 'Data Scientist'], recruitersOnline: 1 },
];

export const VirtualCareerFairHub: React.FC = () => {
  const [booths, setBooths] = useState<ICompanyBooth[]>(mockBooths);

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen font-sans">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Virtual Career Fair</h1>
          <p className="text-lg text-gray-600 mt-2">Connect with top companies and join live queues.</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold shadow-sm border border-blue-200">
          Live Now
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {booths.map(booth => (
          <BoothCard key={booth.id} booth={booth} />
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TeamRadarChartProps {
  currentSkills: Record<string, number>;
  requiredSkills: string[];
}

const TeamRadarChart: React.FC<TeamRadarChartProps> = ({ currentSkills, requiredSkills }) => {
  // Combine all skills for the chart
  const allSkills = Array.from(new Set([...Object.keys(currentSkills), ...requiredSkills]));

  const data = allSkills.map(skill => ({
    subject: skill,
    current: currentSkills[skill] || 0,
    required: requiredSkills.includes(skill) ? 1 : 0, // Baseline representation of "required" gap
  }));

  return (
    <div className="w-full h-64 bg-surface rounded-xl p-4 border border-border-theme shadow-xl">
      <h3 className="text-lg font-semibold text-white mb-2 text-center">Team Skill Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
          
          {/* What we have */}
          <Radar
            name="Current Team Skills"
            dataKey="current"
            stroke="#8b5cf6" // Purple
            fill="#8b5cf6"
            fillOpacity={0.5}
          />
          
          {/* What we need */}
          <Radar
            name="Missing / Needed"
            dataKey="required"
            stroke="#f43f5e" // Rose
            fill="#f43f5e"
            fillOpacity={0.3}
          />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      <div className="flex justify-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
          <span className="text-text-muted">Current Skills</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-rose-500 opacity-70 rounded-sm"></div>
          <span className="text-text-muted">Needed (Gaps)</span>
        </div>
      </div>
    </div>
  );
};

export default TeamRadarChart;

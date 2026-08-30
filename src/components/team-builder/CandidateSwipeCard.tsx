import React, { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { User, Code, MapPin } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  skills: string[];
  timezone?: string;
  matchScore: number;
}

interface CandidateSwipeCardProps {
  candidate: Candidate;
  onSwipe: (candidateId: string, direction: "left" | "right") => void;
}

const CandidateSwipeCard: React.FC<CandidateSwipeCardProps> = ({ candidate, onSwipe }) => {
  const [exitX, setExitX] = useState<number | string>(0);
  const x = useMotionValue(0);
  
  // Transform x position to rotation and opacity for effect
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      setExitX(200);
      onSwipe(candidate.id, "right");
    } else if (info.offset.x < -100) {
      setExitX(-200);
      onSwipe(candidate.id, "left");
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ duration: 0.3 }}
      className="absolute top-0 w-full max-w-sm bg-surface border border-border-theme rounded-2xl shadow-2xl p-6 cursor-grab active:cursor-grabbing flex flex-col items-center gap-4"
    >
      <div className="w-24 h-24 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-4xl text-white font-bold shadow-lg">
        {candidate.name.charAt(0)}
      </div>
      
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <User className="w-5 h-5 text-purple-400" />
          {candidate.name}
        </h3>
        <p className="text-text-muted text-sm mt-1">Match Score: {candidate.matchScore}</p>
        
        {candidate.timezone && (
          <p className="text-text-secondary text-xs mt-2 flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" />
            {candidate.timezone}
          </p>
        )}
      </div>

      <div className="w-full mt-4">
        <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
          <Code className="w-4 h-4 text-blue-400" />
          Skills
        </h4>
        <div className="flex flex-wrap gap-2 justify-center">
          {candidate.skills.map((skill, idx) => (
            <span key={idx} className="px-3 py-1 bg-surface-secondary text-purple-300 text-xs rounded-full border border-border-theme">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between w-full mt-6 px-4">
        <button 
          onClick={() => { setExitX(-200); onSwipe(candidate.id, "left"); }}
          className="w-12 h-12 rounded-full bg-surface-secondary border-2 border-red-500 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition"
        >
          ✕
        </button>
        <button 
          onClick={() => { setExitX(200); onSwipe(candidate.id, "right"); }}
          className="w-12 h-12 rounded-full bg-surface-secondary border-2 border-green-500 flex items-center justify-center text-green-500 hover:bg-green-500/20 transition"
        >
          ♥
        </button>
      </div>
    </motion.div>
  );
};

export default CandidateSwipeCard;

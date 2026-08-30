import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { Users, Clock, Coffee, Play, Pause } from 'lucide-react';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const FocusRoom: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const [phase, setPhase] = useState<'focus' | 'break'>('focus');
  const [remainingTime, setRemainingTime] = useState<number>(50 * 60);
  const [liveUsers, setLiveUsers] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create an audio element for the gentle bell
    // Using a reliable open-source chime sound
    audioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_c6ccf3232f.mp3?filename=singing-bowl-strike-1-85750.mp3');
    
    if (!socket) return;

    socket.emit('joinFocusRoom');

    const handleTimerTick = (data: { phase: 'focus' | 'break'; remainingSeconds: number }) => {
      setPhase((prevPhase) => {
        if (prevPhase !== data.phase && prevPhase !== null) {
          // Play sound on phase change
          audioRef.current?.play().catch((e) => console.log('Audio play failed:', e));
        }
        return data.phase;
      });
      setRemainingTime(data.remainingSeconds);
    };

    const handleUserCount = (count: number) => {
      setLiveUsers(count);
    };

    socket.on('timer_tick', handleTimerTick);
    socket.on('user_count_update', handleUserCount);

    return () => {
      socket.emit('leaveFocusRoom');
      socket.off('timer_tick', handleTimerTick);
      socket.off('user_count_update', handleUserCount);
    };
  }, [socket]);

  // Determine colors based on phase
  const bgClass = phase === 'focus' 
    ? 'from-blue-900 to-indigo-900' 
    : 'from-emerald-800 to-teal-900';
    
  const textClass = phase === 'focus' ? 'text-blue-200' : 'text-emerald-200';
  const accentClass = phase === 'focus' ? 'bg-blue-600' : 'bg-emerald-600';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-full w-full rounded-3xl overflow-hidden bg-gradient-to-br ${bgClass} flex flex-col items-center justify-center relative p-8 shadow-2xl`}
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-surface blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[30%] -right-[10%] w-[80%] h-[80%] rounded-full bg-surface blur-[120px]"
        />
      </div>

      <div className="z-10 flex flex-col items-center justify-center w-full max-w-4xl space-y-12">
        {/* Header section */}
        <div className="flex flex-col items-center space-y-4">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-3 px-6 py-3 bg-surface/10 backdrop-blur-md rounded-full border border-white/20"
          >
            <Users className="w-5 h-5 text-white" />
            <span className="text-white font-bold tracking-wide">
              Live: {liveUsers} {liveUsers === 1 ? 'student' : 'students'} focusing right now
            </span>
            <div className="flex gap-1 ml-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-2 text-xl font-medium tracking-widest uppercase ${textClass}`}
            >
              {phase === 'focus' ? <Clock className="w-6 h-6" /> : <Coffee className="w-6 h-6" />}
              <span>{phase === 'focus' ? 'Deep Focus Time' : 'Take a Break'}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Massive Timer */}
        <div className="relative">
          <motion.h1 
            className="text-[12rem] font-black text-white tracking-tighter leading-none filter drop-shadow-2xl tabular-nums"
            style={{ textShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
          >
            {formatTime(remainingTime)}
          </motion.h1>
          
          {/* Progress Ring Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-[2px] border-white/10 rounded-full opacity-50 pointer-events-none" />
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-xl backdrop-blur-md text-white text-sm flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Connecting to timer...
          </motion.div>
        )}
        
        <p className="text-white/60 text-sm max-w-md text-center">
          The timer is synchronized globally. Everyone in the YuvaHub community is focusing and taking breaks at the exact same time.
        </p>
      </div>
    </motion.div>
  );
};

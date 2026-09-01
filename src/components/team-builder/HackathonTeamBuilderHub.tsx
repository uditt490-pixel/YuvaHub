import React, { useState, useEffect } from "react";
import CandidateSwipeCard from "./CandidateSwipeCard";
import TeamRadarChart from "./TeamRadarChart";
import InviteInboxModal from "./InviteInboxModal";
import { Users, Mail, Loader2, Search } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import io from "socket.io-client";

// Mock data for demonstration until API is connected
const MOCK_CURRENT_SKILLS = {
  "React": 8,
  "Node.js": 7,
  "MongoDB": 6
};

const MOCK_REQUIRED_SKILLS = ["Figma", "UI/UX", "Tailwind CSS"];

const MOCK_CANDIDATES = [
  { id: "c1", name: "Alex Designer", skills: ["Figma", "UI/UX", "Adobe XD"], timezone: "PST", matchScore: 95 },
  { id: "c2", name: "Sam Frontend", skills: ["React", "Tailwind CSS", "Framer Motion"], timezone: "EST", matchScore: 80 },
  { id: "c3", name: "Jordan Fullstack", skills: ["Node.js", "React", "PostgreSQL"], timezone: "GMT", matchScore: 40 },
];

const HackathonTeamBuilderHub: React.FC = () => {
  const { user } = useAppContext() || { user: null };
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [invites, setInvites] = useState<any[]>([]);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    if (user?.uid) {
      // Connect to Socket.io for real-time invites
      const newSocket = io(process.env.VITE_API_URL || "http://localhost:5000");
      setSocket(newSocket);

      newSocket.emit("joinDmRoom", user.uid);

      newSocket.on("receive_team_invite", (invite: any) => {
        setInvites(prev => [...prev, invite]);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const handleSwipe = (candidateId: string, direction: "left" | "right") => {
    if (direction === "right") {
      // Send Invite API Call would go here
      console.log(`Sending invite to ${candidateId}`);
    }
    
    // Move to next candidate after a short delay for animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const handleAcceptInvite = (inviteId: string) => {
    // API call to accept
    setInvites(prev => prev.filter(inv => inv.id !== inviteId));
  };

  const handleDeclineInvite = (inviteId: string) => {
    // API call to decline
    setInvites(prev => prev.filter(inv => inv.id !== inviteId));
  };

  const activeCandidate = candidates[currentIndex];

  return (
    <div className="font-sans h-full flex flex-col w-full">
      <div className="w-full h-full flex flex-col">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500 flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-500" />
              Team Matchmaker
            </h1>
            <p className="text-text-muted mt-2">Find the perfect additions to your hackathon dream team.</p>
          </div>
          
          <button 
            onClick={() => setIsInboxOpen(true)}
            className="relative px-5 py-2.5 bg-surface border border-border-theme hover:border-purple-500 rounded-xl transition flex items-center gap-2 font-medium shadow-lg"
          >
            <Mail className="w-5 h-5 text-text-primary" />
            Inbox
            {invites.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-text-primary text-xs font-bold flex items-center justify-center rounded-full animate-bounce">
                {invites.length}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Swipe Area */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[550px] relative bg-surface rounded-3xl border border-border-theme p-8 overflow-hidden">
            <h2 className="absolute top-6 left-6 text-xl font-bold text-text-primary flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-400" />
              Discover Talent
            </h2>

            <div className="relative w-full max-w-sm h-[460px] flex items-center justify-center mt-8">
              {activeCandidate ? (
                // Use key to force re-render for animation when index changes
                <CandidateSwipeCard 
                  key={activeCandidate.id} 
                  candidate={activeCandidate} 
                  onSwipe={handleSwipe} 
                />
              ) : (
                <div className="text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  </div>
                  <p className="text-text-muted text-lg">You've seen everyone!<br/>Check back later for new hackers.</p>
                </div>
              )}
            </div>
            
            <p className="absolute bottom-6 text-text-secondary text-sm">
              Swipe Left to skip, Swipe Right to invite
            </p>
          </div>

          {/* Right Column: Analytics & Radar */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <TeamRadarChart 
              currentSkills={MOCK_CURRENT_SKILLS} 
              requiredSkills={MOCK_REQUIRED_SKILLS} 
            />
            
            <div className="bg-surface rounded-xl p-6 border border-border-theme shadow-xl">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Your Open Roles</h3>
              <div className="flex flex-wrap gap-2">
                {MOCK_REQUIRED_SKILLS.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-rose-500/10 text-rose-400 text-sm font-medium rounded-lg border border-rose-500/20">
                    {skill}
                  </span>
                ))}
              </div>
              <button className="mt-6 w-full py-2.5 rounded-lg border border-purple-500/50 text-purple-400 font-medium hover:bg-purple-500/10 transition">
                Edit Open Roles
              </button>
            </div>
          </div>
          
        </div>
      </div>

      <InviteInboxModal 
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        invites={invites}
        onAccept={handleAcceptInvite}
        onDecline={handleDeclineInvite}
      />
    </div>
  );
};

export default HackathonTeamBuilderHub;

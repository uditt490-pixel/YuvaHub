import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Check, X } from "lucide-react";

interface TeamInvite {
  id: string;
  teamId: string;
  teamName: string;
  role: string;
  createdAt: string;
}

interface InviteInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  invites: TeamInvite[];
  onAccept: (inviteId: string) => void;
  onDecline: (inviteId: string) => void;
}

const InviteInboxModal: React.FC<InviteInboxModalProps> = ({ isOpen, onClose, invites, onAccept, onDecline }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface border border-border-theme rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6 border-b border-border-theme flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="text-purple-400" />
                Team Invites
              </h2>
              <button 
                onClick={onClose}
                className="text-text-muted hover:text-white transition"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {invites.length === 0 ? (
                <div className="text-center text-text-muted py-8">
                  No pending invites right now.
                </div>
              ) : (
                <div className="space-y-4">
                  {invites.map((invite) => (
                    <motion.div 
                      key={invite.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-surface-secondary rounded-xl p-4 border border-border-theme flex flex-col gap-3"
                    >
                      <div>
                        <h4 className="text-lg font-semibold text-white">{invite.teamName}</h4>
                        <p className="text-sm text-text-muted">Wants you as: <span className="text-purple-400 font-medium">{invite.role}</span></p>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => onDecline(invite.id)}
                          className="flex-1 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" /> Decline
                        </button>
                        <button 
                          onClick={() => onAccept(invite.id)}
                          className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition flex items-center justify-center gap-2 font-medium"
                        >
                          <Check className="w-4 h-4" /> Accept
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InviteInboxModal;

import React, { useState, useRef } from 'react';
import { X, Twitter, Linkedin, MessageCircle, Copy, Check } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: { title: string; link: string } | null;
}

export default function ShareModal({ isOpen, onClose, opportunity }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // The custom hook handles all the complex keyboard trapping logic now!
  useFocusTrap(modalRef, isOpen, onClose);

  if (!isOpen || !opportunity) return null;

  const shareText = `Check out this opportunity: ${opportunity.title}`;
  const shareUrl = opportunity.link || window.location.href;

  const links = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="bg-surface border border-border-theme rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 outline-none"
      >
        <div className="p-4 border-b border-border-theme flex justify-between items-center bg-surface-secondary">
          <h3 id="share-modal-title" className="font-semibold text-text-primary">Share Opportunity</h3>
          <button 
            onClick={onClose} 
            className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5">
          <p className="text-sm font-medium text-text-secondary mb-4 line-clamp-2">{opportunity.title}</p>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <a 
              href={links.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-surface-secondary text-text-primary transition-colors border border-transparent hover:border-border-theme"
            >
              <div className="w-10 h-10 rounded-full bg-[#0077b5] flex items-center justify-center text-white">
                <Linkedin className="w-5 h-5" fill="currentColor" />
              </div>
              <span className="text-xs font-semibold">LinkedIn</span>
            </a>
            
            <a 
              href={links.twitter} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-surface-secondary text-text-primary transition-colors border border-transparent hover:border-border-theme"
            >
              <div className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">
                <Twitter className="w-5 h-5" fill="currentColor" />
              </div>
              <span className="text-xs font-semibold">Twitter</span>
            </a>
            
            <a 
              href={links.whatsapp} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-surface-secondary text-text-primary transition-colors border border-transparent hover:border-border-theme"
            >
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                <MessageCircle className="w-5 h-5" fill="currentColor" />
              </div>
              <span className="text-xs font-semibold">WhatsApp</span>
            </a>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 p-2 bg-background border border-border-theme rounded-lg">
              <input 
                type="text" 
                readOnly 
                value={shareUrl}
                className="flex-1 bg-transparent border-none text-sm text-text-primary focus:outline-none"
              />
              <button 
                onClick={handleCopy}
                className="p-1.5 bg-surface border border-border-theme rounded-md text-text-secondary hover:text-primary-blue hover:border-primary-blue transition-colors"
                title="Copy link"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && <span className="absolute -top-7 right-0 text-[10px] bg-text-primary text-surface px-2 py-1 rounded">Copied!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

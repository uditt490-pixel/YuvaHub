import React, { useState, useEffect, useRef } from 'react';
import { X, Twitter, Linkedin, MessageCircle, Copy, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: { title: string; link: string } | null;
}

export default function ShareModal({ isOpen, onClose, opportunity }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    if (modalRef.current) {
      const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as NodeListOf<HTMLElement>;
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 id="share-modal-title" className="font-semibold text-gray-900">Share Opportunity</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5">
          <p className="text-sm font-medium text-gray-700 mb-4 line-clamp-2">{opportunity.title}</p>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <a 
              href={links.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-blue-50 text-blue-700 transition-colors border border-transparent hover:border-blue-100"
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
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-sky-50 text-sky-700 transition-colors border border-transparent hover:border-sky-100"
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
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-green-50 text-green-700 transition-colors border border-transparent hover:border-green-100"
            >
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                <MessageCircle className="w-5 h-5" fill="currentColor" />
              </div>
              <span className="text-xs font-semibold">WhatsApp</span>
            </a>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
              <input 
                type="text" 
                readOnly 
                value={shareUrl}
                className="flex-1 bg-transparent border-none text-sm text-gray-600 focus:outline-none"
              />
              <button 
                onClick={handleCopy}
                className="p-1.5 bg-white border border-gray-200 rounded-md text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-colors"
                title="Copy link"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && <span className="absolute -top-7 right-0 text-[10px] bg-gray-800 text-white px-2 py-1 rounded">Copied!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

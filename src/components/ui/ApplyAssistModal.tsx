import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Loader2, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface ApplyAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string | null;
  isLoading: boolean;
  opportunityTitle: string;
}

export default function ApplyAssistModal({ isOpen, onClose, content, isLoading, opportunityTitle }: ApplyAssistModalProps) {
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

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-assist-title"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="apply-assist-title" className="font-bold text-gray-900 leading-none mb-1 text-lg">Apply Assist</h3>
                  <p className="text-xs font-medium text-gray-500">AI-generated draft for {opportunityTitle}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                aria-label="Close apply assist dialog"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <p className="font-bold text-gray-900">Magically drafting your SOP...</p>
                  <p className="text-sm text-gray-500 mt-2">Analyzing your profile and matching it with the opportunity context.</p>
                </div>
              ) : content ? (
                <div className="prose prose-blue max-w-none">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Generated Draft</span>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Copy to Clipboard
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-sm text-gray-800 leading-relaxed font-serif">
                    <div className="prose prose-sm prose-blue max-w-none">
                      <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100 italic text-xs text-amber-800">
                    <span className="font-bold shrink-0">Note:</span>
                    <p>This is an AI-generated draft. Please review and substitute placeholders like [Insert Detail] with your specific experiences before submitting.</p>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center">
                  <p className="text-gray-500">Unable to generate content. Please try again.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button 
                onClick={handleCopy}
                disabled={!content || isLoading}
                className="clean-btn px-8 py-2.5 flex items-center gap-2 text-sm shadow-md disabled:opacity-50"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Done" : "Copy Draft"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

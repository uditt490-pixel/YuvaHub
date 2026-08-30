import React from 'react';
import { X, Loader2 } from 'lucide-react';
import FlashcardCarousel, { Flashcard } from './FlashcardCarousel';

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  flashcards: Flashcard[];
  opportunityTitle: string;
}

export default function FlashcardModal({
  isOpen,
  onClose,
  isLoading,
  flashcards,
  opportunityTitle,
}: FlashcardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-background dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-border-theme dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-border-theme dark:border-slate-800 flex items-center justify-between bg-surface dark:bg-slate-900 shrink-0">
          <div>
            <h3 className="font-serif font-bold text-lg text-text-primary dark:text-white">
              AI Study Flashcards
            </h3>
            <p className="text-xs text-text-muted truncate max-w-sm">
              Preparation for {opportunityTitle}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
              <Loader2 className="w-8 h-8 text-primary-blue animate-spin" />
              <h3 className="font-serif font-bold text-lg text-text-primary dark:text-white">
                Generating personalized flashcards...
              </h3>
              <p className="text-sm text-text-muted max-w-sm">
                Our AI is analyzing the job description to create technical interview questions just for you.
              </p>
            </div>
          ) : flashcards.length > 0 ? (
            <FlashcardCarousel flashcards={flashcards} />
          ) : (
            <div className="text-center py-16">
              <p className="text-text-muted">No flashcards available. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

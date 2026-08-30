import React, { useState } from 'react';
import { useOpportunityNote } from '../../hooks/useOpportunityNote';
import { FileText, Save, Loader2, Pin, PinOff, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface OpportunityNotePanelProps {
  opportunityId: string;
}

const COLOR_OPTIONS = [
  { id: 'blue', class: 'bg-blue-100 border-blue-300 text-blue-900', pickerClass: 'bg-blue-500' },
  { id: 'emerald', class: 'bg-emerald-100 border-emerald-300 text-emerald-900', pickerClass: 'bg-emerald-500' },
  { id: 'purple', class: 'bg-purple-100 border-purple-300 text-purple-900', pickerClass: 'bg-purple-500' },
  { id: 'amber', class: 'bg-amber-100 border-amber-300 text-amber-900', pickerClass: 'bg-amber-500' },
  { id: 'rose', class: 'bg-rose-100 border-rose-300 text-rose-900', pickerClass: 'bg-rose-500' },
  { id: 'slate', class: 'bg-slate-100 border-slate-300 text-slate-900', pickerClass: 'bg-slate-500' },
];

export default function OpportunityNotePanel({ opportunityId }: OpportunityNotePanelProps) {
  const { note, isLoading, isSaving, updateNoteField, removeNote } = useOpportunityNote(opportunityId);
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full h-12 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center border border-gray-200">
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
      </div>
    );
  }

  const hasNote = note && (note.content || note.isPinned || note.color !== 'blue');
  const activeColorObj = COLOR_OPTIONS.find(c => c.id === note?.color) || COLOR_OPTIONS[0];

  return (
    <div className={`w-full rounded-2xl border transition-all duration-300 overflow-hidden ${hasNote ? activeColorObj.class : 'bg-surface border-gray-200'}`}>
      
      {/* Header / Toggle */}
      <div 
        className="px-4 py-3 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <FileText className={`w-4 h-4 ${hasNote ? 'opacity-80' : 'text-gray-400'}`} />
          <span className={`text-sm font-bold ${hasNote ? '' : 'text-gray-600'}`}>
            {hasNote ? 'Private Note' : 'Add Private Note'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isSaving && (
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold opacity-70">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving
            </span>
          )}
          {!isSaving && hasNote && (
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold opacity-70">
              <Save className="w-3 h-3" /> Saved
            </span>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 opacity-70" /> : <ChevronDown className="w-4 h-4 opacity-70" />}
        </div>
      </div>

      {/* Expanded Editor */}
      {isOpen && note && (
        <div className="p-4 pt-0 space-y-3 animate-fade-in">
          <textarea
            value={note.content || ''}
            onChange={(e) => updateNoteField('content', e.target.value)}
            placeholder="Write your private context, follow-up actions, or thoughts here..."
            className={`w-full h-32 p-3 text-sm rounded-xl border focus:outline-none focus:ring-2 bg-surface/50 backdrop-blur-sm transition-all resize-none ${hasNote ? 'border-black/10 focus:ring-black/20 text-inherit placeholder-black/40' : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800 placeholder-gray-400'}`}
            maxLength={2000}
          />
          
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateNoteField('color', c.id)}
                  className={`w-5 h-5 rounded-full ${c.pickerClass} border-2 transition-transform ${note.color === c.id ? 'border-white scale-110 shadow-md ring-1 ring-black/10' : 'border-transparent scale-90 opacity-60 hover:opacity-100 hover:scale-100'}`}
                  title={`Set tag color to ${c.id}`}
                  type="button"
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateNoteField('isPinned', !note.isPinned)}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold ${note.isPinned ? 'bg-black/10 text-black/80' : 'text-black/40 hover:bg-black/5 hover:text-black/60'}`}
                title={note.isPinned ? "Unpin note" : "Pin note"}
              >
                {note.isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
                {note.isPinned ? 'Pinned' : 'Pin'}
              </button>

              {hasNote && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Delete this note?')) {
                      removeNote();
                      setIsOpen(false);
                    }
                  }}
                  className="p-1.5 text-red-500/70 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchOpportunityNote, upsertOpportunityNote, deleteOpportunityNote } from '../services/apiClient';
import { OpportunityNote } from '../models/opportunityNoteSchema';

export function useOpportunityNote(opportunityId: string) {
  const [note, setNote] = useState<OpportunityNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInitialLoad = useRef(true);

  const loadNote = useCallback(async () => {
    if (!opportunityId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchOpportunityNote(opportunityId);
      if (data) {
        setNote(data);
      } else {
        setNote({
          userId: '', // Provided by backend
          opportunityId,
          content: '',
          color: 'blue',
          isPinned: false
        });
      }
    } catch (err) {
      setError('Failed to load note.');
    } finally {
      setIsLoading(false);
    }
  }, [opportunityId]);

  useEffect(() => {
    isInitialLoad.current = true;
    loadNote();
  }, [loadNote]);

  // Debounced auto-save
  useEffect(() => {
    // Prevent saving on the initial load when note is first set
    if (isInitialLoad.current) {
      if (note !== null) {
        isInitialLoad.current = false;
      }
      return;
    }

    if (!note || (!note.content && !note.isPinned && note.color === 'blue')) {
       // If completely empty and defaults, we might not want to save, or maybe delete if it existed
       return;
    }

    const saveNote = async () => {
      try {
        setIsSaving(true);
        setError(null);
        await upsertOpportunityNote(opportunityId, note.content || '', note.color || 'blue', note.isPinned || false);
      } catch (err) {
        setError('Failed to save note.');
      } finally {
        setIsSaving(false);
      }
    };

    const handler = setTimeout(() => {
      saveNote();
    }, 1000); // 1s debounce

    return () => {
      clearTimeout(handler);
    };
  }, [note, opportunityId]);

  const updateNoteField = (field: keyof OpportunityNote, value: any) => {
    setNote(prev => prev ? { ...prev, [field]: value } : null);
  };

  const removeNote = async () => {
    try {
      setIsSaving(true);
      await deleteOpportunityNote(opportunityId);
      setNote({
        userId: '',
        opportunityId,
        content: '',
        color: 'blue',
        isPinned: false
      });
    } catch (err) {
      setError('Failed to delete note.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    note,
    isLoading,
    isSaving,
    error,
    updateNoteField,
    removeNote
  };
}

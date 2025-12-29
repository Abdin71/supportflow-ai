/**
 * useAI Hook - Manage AI reply suggestions state
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { aiService, getFallbackSuggestions } from '@/lib/firebase/ai';
import type { AIMetadata } from '@/lib/firebase/types';

export function useAI(ticketId?: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [aiStatus, setAIStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [aiMetadata, setAIMetadata] = useState<AIMetadata | null>(null);
  const [confidence, setConfidence] = useState<number>(0);

  // Subscribe to AI metadata changes
  useEffect(() => {
    if (!ticketId) return;

    const unsubscribe = aiService.subscribeToTicketAI(ticketId, (metadata) => {
      setAIMetadata(metadata);
    });

    return unsubscribe;
  }, [ticketId]);

  // Generate new AI suggestions
  const generateSuggestions = useCallback(async () => {
    if (!ticketId) return;
    
    setGenerating(true);
    setAIStatus('processing');
    
    try {
      const result = await aiService.generateReplySuggestions(ticketId);
      
      if (result.success && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
        setConfidence(result.confidence);
        setAIStatus('completed');
      } else {
        // Use fallback suggestions
        const category = aiMetadata?.category;
        const fallbackSuggestions = getFallbackSuggestions(category);
        setSuggestions(fallbackSuggestions);
        setConfidence(0.5);
        setAIStatus('completed');
      }
    } catch (error) {
      setAIStatus('failed');
      console.error('Failed to generate suggestions:', error);
      
      // Fallback to category-based suggestions
      const category = aiMetadata?.category;
      const fallbackSuggestions = getFallbackSuggestions(category);
      setSuggestions(fallbackSuggestions);
      setConfidence(0.3);
    } finally {
      setGenerating(false);
    }
  }, [ticketId, aiMetadata]);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setAIStatus('idle');
    setConfidence(0);
  }, []);

  return {
    suggestions,
    generating,
    aiStatus,
    aiMetadata,
    confidence,
    generateSuggestions,
    clearSuggestions,
  };
}

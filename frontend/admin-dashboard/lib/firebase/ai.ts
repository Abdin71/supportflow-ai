/**
 * AI Service - Firebase Cloud Functions Integration
 * Handles AI-powered ticket analysis and reply suggestions
 */

import { db, app } from './config';
import { doc, onSnapshot, getDoc, Unsubscribe } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { AIMetadata } from './types';

// Initialize Firebase Functions
const functions = getFunctions(app);
// For local emulator (optional):
// connectFunctionsEmulator(functions, "localhost", 5001);

export interface GenerateSuggestionsResponse {
  success: boolean;
  suggestions: string[];
  confidence: number;
  usedFallback?: boolean;
}

export const aiService = {
  /**
   * Call Cloud Function to generate AI reply suggestions
   */
  generateReplySuggestions: async (ticketId: string): Promise<GenerateSuggestionsResponse> => {
    try {
      const generateSuggestions = httpsCallable<
        { ticketId: string },
        GenerateSuggestionsResponse
      >(functions, 'generateReplySuggestions');
      
      const result = await generateSuggestions({ ticketId });
      return result.data;
    } catch (error) {
      console.error('AI suggestion generation failed:', error);
      // Return fallback empty array with error indicator
      return {
        success: false,
        suggestions: [],
        confidence: 0,
        usedFallback: true,
      };
    }
  },

  /**
   * Subscribe to ticket AI metadata changes (real-time)
   */
  subscribeToTicketAI: (
    ticketId: string,
    callback: (aiData: AIMetadata | null) => void
  ): Unsubscribe => {
    return onSnapshot(doc(db, 'tickets', ticketId), (docSnap) => {
      if (docSnap.exists()) {
        const ticket = docSnap.data();
        callback(ticket?.aiMetadata || null);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error subscribing to AI metadata:', error);
      callback(null);
    });
  },

  /**
   * Get current AI metadata for a ticket (one-time fetch)
   */
  getAIMetadata: async (ticketId: string): Promise<AIMetadata | null> => {
    try {
      const docSnap = await getDoc(doc(db, 'tickets', ticketId));
      if (docSnap.exists()) {
        const ticket = docSnap.data();
        return ticket?.aiMetadata || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching AI metadata:', error);
      return null;
    }
  },
};

/**
 * Fallback suggestions by category (client-side)
 */
export const getFallbackSuggestions = (category?: string): string[] => {
  const fallbacks: Record<string, string[]> = {
    'Account & Login': [
      "I'll help you resolve this account issue. Could you please verify your email address?",
      "Let me assist with your login problem. Have you tried resetting your password recently?",
      "I understand you're having account difficulties. I'll look into this right away.",
    ],
    'Technical Support': [
      "I'll help troubleshoot this technical issue. Can you provide more details about the error you're seeing?",
      "Let me assist with this technical problem. What browser and device are you using?",
      "I understand you're experiencing technical difficulties. Let's work through this together.",
    ],
    'Billing & Payments': [
      "I'll help resolve this billing concern. Let me review your account details.",
      "I understand your payment issue. I'll check your billing history right away.",
      "Let me assist with your billing inquiry. Can you provide the transaction date?",
    ],
    'Feature Request': [
      "Thank you for this feature request! I've forwarded it to our product team.",
      "I appreciate your suggestion. This is valuable feedback for our development roadmap.",
      "Great idea! I'll make sure our team reviews this feature request.",
    ],
    'Bug Report': [
      "Thank you for reporting this bug. I'll escalate this to our engineering team immediately.",
      "I understand this issue is affecting your experience. Let me investigate this further.",
      "I appreciate you bringing this to our attention. Can you provide steps to reproduce the issue?",
    ],
  };

  return fallbacks[category || 'General Inquiry'] || [
    "Thank you for reaching out. How can I help you today?",
    "I'll be happy to assist you with this issue.",
    "I understand your concern. Let me help you resolve this.",
  ];
};

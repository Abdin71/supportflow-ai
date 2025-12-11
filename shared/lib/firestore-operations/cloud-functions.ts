/**
 * Cloud Functions Integration
 * 
 * This file contains ONLY the functions that require Cloud Functions:
 * - AI-powered features (OpenAI API calls)
 * 
 * Everything else uses direct Firestore operations (see tickets.ts, messages.ts)
 */

import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// ============================================================================
// AI FEATURES (Cloud Functions Only)
// ============================================================================

/**
 * Generate AI reply suggestions
 * 
 * This is one of the few operations that REQUIRES a Cloud Function
 * because it calls the OpenAI API (external service).
 * 
 * Admin only.
 */
export async function generateReplySuggestions(ticketId: string): Promise<{
  success: boolean;
  suggestions: string[];
  confidence: number;
  usedFallback?: boolean;
}> {
  try {
    const generateSuggestions = httpsCallable(functions, 'generateReplySuggestions');
    const result = await generateSuggestions({ ticketId });

    return result.data as {
      success: boolean;
      suggestions: string[];
      confidence: number;
      usedFallback?: boolean;
    };
  } catch (error) {
    console.error('Error generating reply suggestions:', error);
    throw new Error('Failed to generate AI suggestions. Please try again.');
  }
}

/**
 * NOTE: Ticket analysis is automatic via Firestore trigger
 * 
 * When a ticket is created in Firestore, the `analyzeTicketOnCreate` trigger
 * automatically calls OpenAI to categorize it.
 * 
 * No manual function call needed! Just create the ticket with:
 * aiMetadata: { processingStatus: 'pending' }
 * 
 * The AI will update it to 'completed' with category, priority, and tags.
 */

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Creating a ticket and letting AI analyze it automatically
 * 
 * ```typescript
 * import { createTicket } from '@/lib/firestore-operations/tickets';
 * 
 * // 1. Create ticket (direct Firestore write)
 * const ticketId = await createTicket({
 *   subject: 'Cannot login to my account',
 *   description: 'Getting error: "Invalid credentials"',
 *   userId: currentUser.uid,
 *   userEmail: currentUser.email,
 *   userName: currentUser.displayName
 * });
 * 
 * // 2. AI analysis happens automatically via Firestore trigger!
 * //    No need to call any function.
 * 
 * // 3. Subscribe to updates to see when AI completes
 * const unsubscribe = subscribeToTicket(ticketId, (ticket) => {
 *   if (ticket.aiMetadata.processingStatus === 'completed') {
 *     console.log('AI categorized as:', ticket.category);
 *     console.log('Priority:', ticket.priority);
 *     console.log('Tags:', ticket.tags);
 *   }
 * });
 * ```
 */

/**
 * Example: Getting AI reply suggestions (admin only)
 * 
 * ```typescript
 * import { generateReplySuggestions } from '@/lib/cloud-functions';
 * 
 * const { suggestions, confidence } = await generateReplySuggestions(ticketId);
 * 
 * // Display the 3 suggestions to the agent
 * suggestions.forEach((suggestion, index) => {
 *   console.log(`Suggestion ${index + 1}: ${suggestion}`);
 * });
 * ```
 */

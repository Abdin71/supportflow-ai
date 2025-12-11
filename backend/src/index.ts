import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// CLOUD FUNCTION #1: AI Ticket Analysis (Triggered automatically on ticket creation)
// ============================================================================

export const analyzeTicketOnCreate = functions.firestore
  .document('tickets/{ticketId}')
  .onCreate(async (snapshot, context) => {
    const ticket = snapshot.data();
    const ticketId = context.params.ticketId;

    try {
      // Update processing status
      await snapshot.ref.update({
        'aiMetadata.processingStatus': 'processing',
        'aiMetadata.startedAt': admin.firestore.FieldValue.serverTimestamp(),
      });

      // Call OpenAI for analysis
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a support ticket analyzer. Respond only with valid JSON.',
          },
          {
            role: 'user',
            content: `Analyze this support ticket and categorize it:

Subject: ${ticket.subject}
Description: ${ticket.description}

Provide response in this exact JSON format:
{
  "category": "one of: Account & Login, Technical Support, Billing & Payments, Feature Request, Bug Report, General Inquiry",
  "priority": "one of: low, medium, high, urgent",
  "tags": ["relevant", "keywords"],
  "confidence": 0.95
}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const analysis = JSON.parse(content);

      // Map priority to index for sorting
      const priorityIndex: Record<string, number> = {
        low: 1,
        medium: 2,
        high: 3,
        urgent: 4,
      };

      // Update Firestore with AI analysis
      await snapshot.ref.update({
        category: analysis.category || 'General Inquiry',
        priority: analysis.priority || 'medium',
        tags: analysis.tags || [],
        priority_index: priorityIndex[analysis.priority as string] || 2,
        category_index: analysis.category || 'General Inquiry',
        'aiMetadata.processingStatus': 'completed',
        'aiMetadata.completedAt': admin.firestore.FieldValue.serverTimestamp(),
        'aiMetadata.confidence': analysis.confidence || 0.8,
        'aiMetadata.modelVersion': 'gpt-4',
      });

      console.log(`Ticket ${ticketId} analyzed successfully`);
    } catch (error) {
      console.error(`Error analyzing ticket ${ticketId}:`, error);

      // Fallback to keyword-based analysis
      const fallback = fallbackAnalysis(ticket.subject, ticket.description);

      await snapshot.ref.update({
        category: fallback.category,
        priority: fallback.priority,
        tags: fallback.tags,
        priority_index: fallback.priority_index,
        category_index: fallback.category,
        'aiMetadata.processingStatus': 'failed',
        'aiMetadata.error': String(error),
        'aiMetadata.completedAt': admin.firestore.FieldValue.serverTimestamp(),
        'aiMetadata.usedFallback': true,
      });
    }
  });

// ============================================================================
// CLOUD FUNCTION #2: Generate AI Reply Suggestions (On-demand, admin only)
// ============================================================================

export const generateReplySuggestions = functions.https.onCall(
  async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication required'
      );
    }

    // Verify admin role
    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Admin access required'
      );
    }

    const { ticketId } = data;

    if (!ticketId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Ticket ID is required'
      );
    }

    try {
      // Get ticket data
      const ticketDoc = await admin
        .firestore()
        .collection('tickets')
        .doc(ticketId)
        .get();

      if (!ticketDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Ticket not found');
      }

      const ticket = ticketDoc.data();

      // Get conversation history
      const messagesSnapshot = await admin
        .firestore()
        .collection('tickets')
        .doc(ticketId)
        .collection('messages')
        .orderBy('createdAt', 'asc')
        .limit(10)
        .get();

      const conversationHistory = messagesSnapshot.docs
        .map((doc) => {
          const msg = doc.data();
          return `${msg.role}: ${msg.text}`;
        })
        .join('\n');

      // Call OpenAI for suggestions
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful customer support assistant. Generate professional, empathetic responses. Respond only with valid JSON.',
          },
          {
            role: 'user',
            content: `Generate 3 professional reply suggestions for this support ticket:

Subject: ${ticket?.subject}
Description: ${ticket?.description}
Category: ${ticket?.category}

${conversationHistory ? `Recent conversation:\n${conversationHistory}` : ''}

Provide response in this exact JSON format:
{
  "suggestions": [
    "First empathetic and helpful reply...",
    "Second actionable reply with steps...",
    "Third follow-up focused reply..."
  ],
  "confidence": 0.9
}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content);

      return {
        success: true,
        suggestions: result.suggestions || [],
        confidence: result.confidence || 0.8,
      };
    } catch (error) {
      console.error('Error generating reply suggestions:', error);

      // Return fallback suggestions
      return {
        success: true,
        suggestions: getFallbackSuggestions(data.category),
        confidence: 0.5,
        usedFallback: true,
      };
    }
  }
);

// ============================================================================
// CLOUD FUNCTION #3: Update derived data on new message (Trigger)
// ============================================================================

export const onMessageAdded = functions.firestore
  .document('tickets/{ticketId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const ticketId = context.params.ticketId;
    const message = snapshot.data();

    try {
      // Update ticket metadata
      await admin
        .firestore()
        .collection('tickets')
        .doc(ticketId)
        .update({
          messageCount: admin.firestore.FieldValue.increment(1),
          lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          hasUnreadMessages: message.role === 'agent', // Mark unread if from agent
        });

      console.log(`Updated metadata for ticket ${ticketId}`);
    } catch (error) {
      console.error(`Error updating ticket metadata:`, error);
    }
  });

// ============================================================================
// HELPER FUNCTIONS (Server-side only, not exported as Cloud Functions)
// ============================================================================

function fallbackAnalysis(subject: string, description: string) {
  const text = `${subject} ${description}`.toLowerCase();

  let category = 'General Inquiry';
  const tags: string[] = [];
  let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';

  // Simple keyword matching
  if (
    text.includes('login') ||
    text.includes('password') ||
    text.includes('account')
  ) {
    category = 'Account & Login';
    tags.push('authentication');
  } else if (
    text.includes('payment') ||
    text.includes('billing') ||
    text.includes('invoice')
  ) {
    category = 'Billing & Payments';
    tags.push('financial');
  } else if (
    text.includes('error') ||
    text.includes('bug') ||
    text.includes('crash')
  ) {
    category = 'Bug Report';
    tags.push('bug');
    priority = 'high';
  } else if (
    text.includes('feature') ||
    text.includes('request') ||
    text.includes('suggest')
  ) {
    category = 'Feature Request';
    tags.push('enhancement');
  }

  if (
    text.includes('urgent') ||
    text.includes('asap') ||
    text.includes('critical')
  ) {
    priority = 'urgent';
  }

  const priorityIndex = { low: 1, medium: 2, high: 3, urgent: 4 };

  return {
    category,
    tags,
    priority,
    priority_index: priorityIndex[priority],
  };
}

function getFallbackSuggestions(category?: string): string[] {
  const fallbacks: Record<string, string[]> = {
    'Account & Login': [
      "Thank you for reaching out. I'll help you resolve your account issue right away. Could you please provide more details about what's happening when you try to log in?",
      "I understand how frustrating login issues can be. Let's get this sorted out. Have you tried resetting your password using the 'Forgot Password' link?",
      "I'm here to help with your account access. To assist you better, could you let me know if you're receiving any error messages?",
    ],
    'Technical Support': [
      "Thank you for reporting this technical issue. I'll investigate this for you. Could you provide any error messages or screenshots?",
      "I appreciate you bringing this to our attention. Let's troubleshoot this together. What browser and operating system are you using?",
      "I'm here to help resolve this technical problem. Have you tried clearing your browser cache or using a different browser?",
    ],
    'Billing & Payments': [
      "Thank you for contacting us about your billing concern. I'll review your account and get back to you with the details.",
      "I understand billing questions are important. Let me look into this for you right away and provide clarification.",
      "I'm here to help with your payment inquiry. Could you please provide your invoice number or transaction date?",
    ],
    default: [
      "Thank you for reaching out to us. I'm reviewing your request and will provide you with a detailed response shortly.",
      "I appreciate you contacting our support team. Let me look into this matter for you and get back with more information.",
      "Thank you for your inquiry. I'm here to help and will make sure we address your concern thoroughly.",
    ],
  };

  return fallbacks[category || 'default'] || fallbacks.default;
}

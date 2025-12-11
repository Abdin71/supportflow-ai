/**
 * Direct Firestore Operations for Messages
 * 
 * All message operations use direct Firestore writes.
 * Firestore triggers handle derived data updates (message count, etc.)
 * 
 * NO Cloud Functions needed for basic message CRUD operations.
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Message {
  id?: string;
  ticketId: string;
  text: string;
  userId: string;
  userName: string;
  userEmail?: string;
  role: 'user' | 'agent';
  isAiSuggestion?: boolean;
  createdAt: Timestamp | Date;
  isEdited?: boolean;
  editedAt?: Timestamp | Date | null;
}

// ============================================================================
// CREATE OPERATIONS (Direct Firestore)
// ============================================================================

/**
 * Add message to ticket - DIRECT FIRESTORE WRITE
 * 
 * Firestore trigger automatically updates ticket metadata (messageCount, lastMessageAt)
 * No Cloud Function needed for this operation
 */
export async function addMessage(messageData: {
  ticketId: string;
  text: string;
  userId: string;
  userName: string;
  role: 'user' | 'agent';
  isAiSuggestion?: boolean;
}): Promise<string> {
  try {
    const messageRef = await addDoc(
      collection(db, 'tickets', messageData.ticketId, 'messages'),
      {
        text: messageData.text,
        userId: messageData.userId,
        userName: messageData.userName,
        role: messageData.role,
        isAiSuggestion: messageData.isAiSuggestion || false,
        isEdited: false,
        createdAt: serverTimestamp(),
      }
    );

    console.log('Message added:', messageRef.id);
    return messageRef.id;
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error('Failed to add message. Please try again.');
  }
}

// ============================================================================
// READ OPERATIONS (Direct Firestore)
// ============================================================================

/**
 * Get messages for a ticket - DIRECT FIRESTORE READ
 * Security rules enforce access control
 */
export async function getMessages(
  ticketId: string,
  limitCount: number = 100
): Promise<Message[]> {
  try {
    const q = query(
      collection(db, 'tickets', ticketId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ticketId,
          ...doc.data(),
        } as Message)
    );
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

// ============================================================================
// UPDATE OPERATIONS (Direct Firestore)
// ============================================================================

/**
 * Update message text - DIRECT FIRESTORE WRITE
 * Security rules enforce:
 * - Users can edit own messages within 5 minutes
 * - Admins can edit anytime
 */
export async function updateMessage(
  ticketId: string,
  messageId: string,
  newText: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'tickets', ticketId, 'messages', messageId), {
      text: newText,
      isEdited: true,
      editedAt: serverTimestamp(),
    });

    console.log(`Message ${messageId} updated`);
  } catch (error) {
    console.error('Error updating message:', error);
    throw new Error('Failed to update message. Check permissions or edit time limit.');
  }
}

// ============================================================================
// DELETE OPERATIONS (Direct Firestore)
// ============================================================================

/**
 * Delete message (admin only) - DIRECT FIRESTORE DELETE
 * Security rules enforce admin-only access
 */
export async function deleteMessage(
  ticketId: string,
  messageId: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, 'tickets', ticketId, 'messages', messageId));

    console.log(`Message ${messageId} deleted`);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw new Error('Failed to delete message. Admin access required.');
  }
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS (Firestore onSnapshot)
// ============================================================================

/**
 * Subscribe to messages in a ticket - REAL-TIME FIRESTORE LISTENER
 * Returns unsubscribe function
 */
export function subscribeToMessages(
  ticketId: string,
  callback: (messages: Message[]) => void
): () => void {
  const q = query(
    collection(db, 'tickets', ticketId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ticketId,
            ...doc.data(),
          } as Message)
      );
      callback(messages);
    },
    (error) => {
      console.error('Error in messages subscription:', error);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to new messages only - REAL-TIME FIRESTORE LISTENER
 * Useful for notifications
 */
export function subscribeToNewMessages(
  ticketId: string,
  callback: (message: Message) => void
): () => void {
  const q = query(
    collection(db, 'tickets', ticketId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  let isFirstSnapshot = true;

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      // Skip the first snapshot (initial load)
      if (isFirstSnapshot) {
        isFirstSnapshot = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          callback({
            id: change.doc.id,
            ticketId,
            ...change.doc.data(),
          } as Message);
        }
      });
    },
    (error) => {
      console.error('Error in new messages subscription:', error);
    }
  );

  return unsubscribe;
}

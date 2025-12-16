import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { Message } from './types';

/**
 * ADMIN MESSAGE OPERATIONS - Direct Firestore with internal message support
 */

// Get all messages for a ticket
export async function getTicketMessages(ticketId: string): Promise<Message[]> {
  const q = query(
    collection(db, 'messages'),
    where('ticketId', '==', ticketId),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Message[];
}

// Subscribe to real-time messages for a ticket
export function subscribeToTicketMessages(
  ticketId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'messages'),
    where('ticketId', '==', ticketId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    callback(messages);
  });
}

// Add message to ticket (supports internal messages)
export async function addMessage(
  ticketId: string,
  userId: string,
  userEmail: string,
  userName: string,
  text: string,
  isInternal: boolean = false
): Promise<string> {
  const messageData = {
    ticketId,
    userId,
    userEmail,
    userName,
    text,
    isInternal,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'messages'), messageData);
  return docRef.id;
}

// Update message (admin can edit any message)
export async function updateMessage(
  messageId: string,
  text: string
): Promise<void> {
  const docRef = doc(db, 'messages', messageId);
  await updateDoc(docRef, {
    text,
    editedAt: serverTimestamp(),
  });
}

// Delete message (admin only)
export async function deleteMessage(messageId: string): Promise<void> {
  const docRef = doc(db, 'messages', messageId);
  await deleteDoc(docRef);
}

// Check if user can edit message (5 minute window or admin)
export function canEditMessage(message: Message, currentUserId: string): boolean {
  // Admin can always edit (check role in component)
  if (message.userId !== currentUserId) {
    return false;
  }

  // 5 minute edit window
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const messageTime = message.createdAt.toMillis();
  
  return messageTime > fiveMinutesAgo;
}

// Get internal messages only (admin only)
export async function getInternalMessages(ticketId: string): Promise<Message[]> {
  const q = query(
    collection(db, 'messages'),
    where('ticketId', '==', ticketId),
    where('isInternal', '==', true),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Message[];
}

// Get public messages only (for user view)
export async function getPublicMessages(ticketId: string): Promise<Message[]> {
  const q = query(
    collection(db, 'messages'),
    where('ticketId', '==', ticketId),
    where('isInternal', '==', false),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Message[];
}

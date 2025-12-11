/**
 * Direct Firestore Operations for Messages
 * User Interface specific implementation
 * 
 * Messages are stored in a separate top-level collection for better scalability
 * and query flexibility. Each message has a ticketId field to link it to a ticket.
 */

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  Unsubscribe,
  where,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from './config';

export interface Message {
  id?: string;
  ticketId: string;
  text: string;
  userId: string;
  userName: string;
  role: 'user' | 'agent';
  isAiSuggestion?: boolean;
  createdAt: Timestamp | Date;
  isEdited?: boolean;
  editedAt?: Timestamp | Date | null;
}

/**
 * Add a new message to a ticket
 */
export async function addMessage(messageData: {
  ticketId: string;
  text: string;
  userId: string;
  userName: string;
  role: 'user' | 'agent';
  isAiSuggestion?: boolean;
}): Promise<string> {
  const messageRef = await addDoc(
    collection(db, 'messages'),
    {
      ticketId: messageData.ticketId,
      text: messageData.text,
      userId: messageData.userId,
      userName: messageData.userName,
      role: messageData.role,
      isAiSuggestion: messageData.isAiSuggestion || false,
      createdAt: serverTimestamp(),
      isEdited: false,
      editedAt: null,
    }
  );

  return messageRef.id;
}

/**
 * Get all messages for a ticket
 */
export async function getMessages(ticketId: string): Promise<Message[]> {
  const q = query(
    collection(db, 'messages'),
    where('ticketId', '==', ticketId),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Message));
}

/**
 * Update a message (within 5 minutes of creation)
 */
export async function updateMessage(
  ticketId: string,
  messageId: string,
  text: string
): Promise<void> {
  await updateDoc(
    doc(db, 'messages', messageId),
    {
      text,
      isEdited: true,
      editedAt: serverTimestamp(),
    }
  );
}

/**
 * Subscribe to real-time message updates
 */
export function subscribeToMessages(
  ticketId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'messages'),
    where('ticketId', '==', ticketId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Message));
    callback(messages);
  });
}

/**
 * Subscribe to new messages only (for notifications)
 */
export function subscribeToNewMessages(
  ticketId: string,
  callback: (message: Message) => void,
  sinceTimestamp?: Date
): Unsubscribe {
  let q = query(
    collection(db, 'messages'),
    where('ticketId', '==', ticketId),
    orderBy('createdAt', 'desc'),
    firestoreLimit(1)
  );

  if (sinceTimestamp) {
    q = query(q, where('createdAt', '>', Timestamp.fromDate(sinceTimestamp)));
  }

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const message = {
          id: change.doc.id,
          ...change.doc.data(),
        } as Message;
        callback(message);
      }
    });
  });
}

/**
 * Check if message can be edited (within 5 minutes)
 */
export function canEditMessage(message: Message): boolean {
  const createdAt = message.createdAt instanceof Timestamp 
    ? message.createdAt.toDate() 
    : message.createdAt;
  const now = new Date();
  const fiveMinutesInMs = 5 * 60 * 1000;
  
  return (now.getTime() - createdAt.getTime()) < fiveMinutesInMs;
}

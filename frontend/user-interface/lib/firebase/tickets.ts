/**
 * Direct Firestore Operations for Tickets
 * User Interface specific implementation
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';

export interface Ticket {
  id?: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  tags?: string[];
  userId: string;
  userEmail: string;
  userName: string;
  assignedAgentId?: string | null;
  assignedAgentName?: string | null;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  lastMessageAt?: Timestamp | Date | null;
  messageCount: number;
  hasUnreadMessages: boolean;
  priority_index?: number;
  category_index?: string;
  aiMetadata: {
    processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
    startedAt?: Timestamp | Date | null;
    completedAt?: Timestamp | Date | null;
    confidence?: number;
    modelVersion?: string;
    usedFallback?: boolean;
    error?: string;
  };
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  limit?: number;
}

/**
 * Create a new ticket
 */
export async function createTicket(ticketData: {
  subject: string;
  description: string;
  userId: string;
  userEmail: string;
  userName: string;
}): Promise<string> {
  const ticketRef = await addDoc(collection(db, 'tickets'), {
    subject: ticketData.subject,
    description: ticketData.description,
    userId: ticketData.userId,
    userEmail: ticketData.userEmail,
    userName: ticketData.userName,
    status: 'open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    messageCount: 0,
    hasUnreadMessages: false,
    aiMetadata: {
      processingStatus: 'pending',
      startedAt: serverTimestamp(),
    },
  });

  return ticketRef.id;
}

/**
 * Get a single ticket by ID
 */
export async function getTicketById(ticketId: string): Promise<Ticket | null> {
  const ticketDoc = await getDoc(doc(db, 'tickets', ticketId));
  
  if (!ticketDoc.exists()) {
    return null;
  }

  return {
    id: ticketDoc.id,
    ...ticketDoc.data(),
  } as Ticket;
}

/**
 * Get all tickets for a user
 * OPTIMIZED: Only uses userId + createdAt to minimize composite indexes
 * Apply additional filters client-side after fetching
 */
export async function getUserTickets(
  userId: string,
  limit?: number
): Promise<Ticket[]> {
  const q = query(
    collection(db, 'tickets'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    firestoreLimit(limit || 100)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Ticket));
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  ticketId: string,
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
): Promise<void> {
  await updateDoc(doc(db, 'tickets', ticketId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Subscribe to real-time ticket updates
 */
export function subscribeToTicket(
  ticketId: string,
  callback: (ticket: Ticket | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'tickets', ticketId), (doc) => {
    if (doc.exists()) {
      callback({
        id: doc.id,
        ...doc.data(),
      } as Ticket);
    } else {
      callback(null);
    }
  });
}

/**
 * Subscribe to user's tickets with real-time updates
 * OPTIMIZED: Only uses userId + createdAt to minimize composite indexes
 * All other filters (status, priority, category) should be done client-side
 */
export function subscribeToUserTickets(
  userId: string,
  callback: (tickets: Ticket[]) => void
): Unsubscribe {
  // SINGLE COMPOSITE INDEX: userId + createdAt
  // Reasonable limit to prevent excessive reads
  const q = query(
    collection(db, 'tickets'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    firestoreLimit(100) // Reasonable default limit
  );

  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Ticket));
    callback(tickets);
  });
}

/**
 * Get ticket statistics for user
 */
export async function getUserTicketStats(userId: string) {
  const tickets = await getUserTickets(userId);
  
  return {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };
}

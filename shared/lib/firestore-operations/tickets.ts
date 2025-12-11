/**
 * Direct Firestore Operations for Tickets
 * 
 * This file contains all ticket-related operations that interact directly with Firestore.
 * NO Cloud Functions are called for basic CRUD operations - only for AI features.
 * 
 * Architecture:
 * - Frontend → Direct Firestore Write → Firestore Trigger → Cloud Function (AI only)
 * - Security and validation enforced by Firestore Security Rules
 * - Real-time updates via Firestore subscriptions
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  WhereFilterOp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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
  assignedAgentId?: string;
  userId?: string;
}

// ============================================================================
// CREATE OPERATIONS (Direct Firestore)
// ============================================================================

/**
 * Create a new ticket - DIRECT FIRESTORE WRITE
 * 
 * After creation, Firestore trigger automatically calls Cloud Function for AI analysis.
 * No need to wait for AI - user gets immediate response with ticket ID.
 * 
 * @param ticketData - Ticket information
 * @returns Promise<string> - Ticket ID
 */
export async function createTicket(ticketData: {
  subject: string;
  description: string;
  userId: string;
  userEmail: string;
  userName: string;
}): Promise<string> {
  try {
    const ticketRef = await addDoc(collection(db, 'tickets'), {
      subject: ticketData.subject,
      description: ticketData.description,
      userId: ticketData.userId,
      userEmail: ticketData.userEmail,
      userName: ticketData.userName,
      status: 'open',
      messageCount: 0,
      hasUnreadMessages: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      aiMetadata: {
        processingStatus: 'pending', // Trigger will update this
      },
    });

    console.log('Ticket created:', ticketRef.id);
    return ticketRef.id;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw new Error('Failed to create ticket. Please try again.');
  }
}

// ============================================================================
// READ OPERATIONS (Direct Firestore)
// ============================================================================

/**
 * Get a single ticket by ID - DIRECT FIRESTORE READ
 * Security rules enforce access control (users see own tickets, admins see all)
 */
export async function getTicketById(ticketId: string): Promise<Ticket> {
  try {
    const ticketDoc = await getDoc(doc(db, 'tickets', ticketId));

    if (!ticketDoc.exists()) {
      throw new Error('Ticket not found');
    }

    return {
      id: ticketDoc.id,
      ...ticketDoc.data(),
    } as Ticket;
  } catch (error) {
    console.error('Error getting ticket:', error);
    throw error;
  }
}

/**
 * Get user's tickets - DIRECT FIRESTORE QUERY
 * Firestore automatically filters based on security rules
 */
export async function getUserTickets(
  userId: string,
  filters?: TicketFilters
): Promise<Ticket[]> {
  try {
    let queryRef = collection(db, 'tickets');
    const constraints: any[] = [where('userId', '==', userId)];

    // Apply optional filters
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.priority) {
      constraints.push(where('priority', '==', filters.priority));
    }
    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }

    // Always order by creation date
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(50));

    const q = query(queryRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Ticket)
    );
  } catch (error) {
    console.error('Error getting user tickets:', error);
    throw error;
  }
}

/**
 * Get all tickets (admin only) - DIRECT FIRESTORE QUERY
 * Security rules enforce admin-only access
 */
export async function getAllTickets(
  filters?: TicketFilters,
  limitCount: number = 100
): Promise<Ticket[]> {
  try {
    let queryRef = collection(db, 'tickets');
    const constraints: any[] = [];

    // Apply filters
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.priority) {
      constraints.push(where('priority_index', '>=', 1)); // Enable composite index
    }
    if (filters?.category) {
      constraints.push(where('category_index', '==', filters.category));
    }
    if (filters?.assignedAgentId) {
      constraints.push(where('assignedAgentId', '==', filters.assignedAgentId));
    }

    // Order and limit
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(limitCount));

    const q = query(queryRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Ticket)
    );
  } catch (error) {
    console.error('Error getting all tickets:', error);
    throw error;
  }
}

/**
 * Search tickets - DIRECT FIRESTORE QUERY
 * Note: Full-text search not available in Firestore, so we fetch and filter client-side
 * For better search, consider Algolia or Elasticsearch integration
 */
export async function searchTickets(
  searchTerm: string,
  userId?: string
): Promise<Ticket[]> {
  try {
    const constraints: any[] = [];

    if (userId) {
      constraints.push(where('userId', '==', userId));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(100));

    const q = query(collection(db, 'tickets'), ...constraints);
    const snapshot = await getDocs(q);

    // Client-side filtering (Firestore doesn't support full-text search)
    const searchLower = searchTerm.toLowerCase();
    return snapshot.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Ticket)
      )
      .filter(
        (ticket) =>
          ticket.subject?.toLowerCase().includes(searchLower) ||
          ticket.description?.toLowerCase().includes(searchLower) ||
          ticket.category?.toLowerCase().includes(searchLower) ||
          ticket.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
  } catch (error) {
    console.error('Error searching tickets:', error);
    throw error;
  }
}

// ============================================================================
// UPDATE OPERATIONS (Direct Firestore)
// ============================================================================

/**
 * Update ticket status - DIRECT FIRESTORE WRITE
 * Security rules validate status transitions
 */
export async function updateTicketStatus(
  ticketId: string,
  newStatus: 'open' | 'in-progress' | 'resolved' | 'closed'
): Promise<void> {
  try {
    await updateDoc(doc(db, 'tickets', ticketId), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    console.log(`Ticket ${ticketId} status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw new Error('Failed to update ticket status. Check permissions.');
  }
}

/**
 * Assign ticket to agent (admin only) - DIRECT FIRESTORE WRITE
 * Security rules enforce admin-only access
 */
export async function assignTicket(
  ticketId: string,
  agentId: string,
  agentName: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'tickets', ticketId), {
      assignedAgentId: agentId,
      assignedAgentName: agentName,
      status: 'in-progress',
      updatedAt: serverTimestamp(),
    });

    console.log(`Ticket ${ticketId} assigned to ${agentName}`);
  } catch (error) {
    console.error('Error assigning ticket:', error);
    throw new Error('Failed to assign ticket. Admin access required.');
  }
}

/**
 * Mark messages as read - DIRECT FIRESTORE WRITE
 */
export async function markTicketAsRead(ticketId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'tickets', ticketId), {
      hasUnreadMessages: false,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking ticket as read:', error);
    throw error;
  }
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS (Firestore onSnapshot)
// ============================================================================

/**
 * Subscribe to ticket updates - REAL-TIME FIRESTORE LISTENER
 * Returns unsubscribe function
 */
export function subscribeToTicket(
  ticketId: string,
  callback: (ticket: Ticket) => void
): () => void {
  const unsubscribe = onSnapshot(
    doc(db, 'tickets', ticketId),
    (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data(),
        } as Ticket);
      }
    },
    (error) => {
      console.error('Error in ticket subscription:', error);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to user's tickets - REAL-TIME FIRESTORE LISTENER
 */
export function subscribeToUserTickets(
  userId: string,
  callback: (tickets: Ticket[]) => void,
  filters?: TicketFilters
): () => void {
  const constraints: any[] = [where('userId', '==', userId)];

  if (filters?.status) {
    constraints.push(where('status', '==', filters.status));
  }

  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(50));

  const q = query(collection(db, 'tickets'), ...constraints);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const tickets = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Ticket)
      );
      callback(tickets);
    },
    (error) => {
      console.error('Error in tickets subscription:', error);
    }
  );

  return unsubscribe;
}

// ============================================================================
// STATISTICS (Direct Firestore Aggregation)
// ============================================================================

/**
 * Get ticket statistics - CLIENT-SIDE AGGREGATION
 * For better performance at scale, use Cloud Functions to maintain aggregate collections
 */
export async function getTicketStats(userId?: string): Promise<{
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}> {
  try {
    const constraints: any[] = [];

    if (userId) {
      constraints.push(where('userId', '==', userId));
    }

    constraints.push(limit(1000)); // Reasonable limit

    const q = query(collection(db, 'tickets'), ...constraints);
    const snapshot = await getDocs(q);

    const stats = {
      total: snapshot.size,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      byPriority: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
    };

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Count by status
      if (data.status === 'open') stats.open++;
      else if (data.status === 'in-progress') stats.inProgress++;
      else if (data.status === 'resolved') stats.resolved++;
      else if (data.status === 'closed') stats.closed++;

      // Count by priority
      if (data.priority) {
        stats.byPriority[data.priority] =
          (stats.byPriority[data.priority] || 0) + 1;
      }

      // Count by category
      if (data.category) {
        stats.byCategory[data.category] =
          (stats.byCategory[data.category] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting ticket stats:', error);
    throw error;
  }
}

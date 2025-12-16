import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  Timestamp,
  Query,
  DocumentSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type {
  Ticket,
  AdminTicketFilters,
  BulkUpdatePayload,
  BulkOperationResult,
  TicketAssignmentResult,
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from './types';

/**
 * ADMIN TICKET OPERATIONS - Direct Firestore with elevated permissions
 * These operations access ALL tickets in the system, not just assigned ones
 */

// Get all tickets with optional filters (admin only)
export async function getAllTickets(filters?: AdminTicketFilters) {
  let q: Query = collection(db, 'tickets');

  // Apply filters
  if (filters?.status && filters.status.length > 0) {
    q = query(q, where('status', 'in', filters.status));
  }

  if (filters?.priority && filters.priority.length > 0) {
    q = query(q, where('priority', 'in', filters.priority));
  }

  if (filters?.category && filters.category.length > 0) {
    q = query(q, where('category', 'in', filters.category));
  }

  if (filters?.assignedTo && filters.assignedTo.length > 0) {
    q = query(q, where('assignedTo', 'in', filters.assignedTo));
  }

  if (filters?.userId) {
    q = query(q, where('userId', '==', filters.userId));
  }

  // Date range filter (client-side for now, or use composite index)
  // Note: Firestore can only do range queries on one field at a time
  if (filters?.dateRange) {
    q = query(
      q,
      where('createdAt', '>=', Timestamp.fromDate(filters.dateRange.from)),
      where('createdAt', '<=', Timestamp.fromDate(filters.dateRange.to))
    );
  }

  // Apply sorting and limit
  q = query(q, orderBy('createdAt', 'desc'), limit(100));

  const snapshot = await getDocs(q);
  let tickets = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Ticket[];

  // Client-side filters for complex queries
  if (filters?.searchQuery) {
    const search = filters.searchQuery.toLowerCase();
    tickets = tickets.filter(
      (ticket) =>
        ticket.subject.toLowerCase().includes(search) ||
        ticket.description.toLowerCase().includes(search) ||
        ticket.userEmail.toLowerCase().includes(search)
    );
  }

  if (filters?.tags && filters.tags.length > 0) {
    tickets = tickets.filter((ticket) =>
      filters.tags!.some((tag) => ticket.tags.includes(tag))
    );
  }

  if (filters?.hasResponse !== undefined) {
    tickets = tickets.filter((ticket) =>
      filters.hasResponse ? ticket.messageCount > 0 : ticket.messageCount === 0
    );
  }

  return tickets;
}

// Subscribe to real-time ticket updates (all tickets)
export function subscribeToAllTickets(
  callback: (tickets: Ticket[]) => void,
  filters?: AdminTicketFilters
): Unsubscribe {
  let q: Query = collection(db, 'tickets');

  // Apply basic filters
  if (filters?.status && filters.status.length > 0) {
    q = query(q, where('status', 'in', filters.status));
  }

  if (filters?.assignedTo && filters.assignedTo.length > 0) {
    q = query(q, where('assignedTo', 'in', filters.assignedTo));
  }

  // Order by creation date
  q = query(q, orderBy('createdAt', 'desc'), limit(100));

  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Ticket[];
    callback(tickets);
  });
}

// Get single ticket by ID (admin can view any ticket)
export async function getTicketById(ticketId: string): Promise<Ticket | null> {
  const docRef = doc(db, 'tickets', ticketId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Ticket;
}

// Subscribe to single ticket updates
export function subscribeToTicket(
  ticketId: string,
  callback: (ticket: Ticket | null) => void
): Unsubscribe {
  const docRef = doc(db, 'tickets', ticketId);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({
        id: snapshot.id,
        ...snapshot.data(),
      } as Ticket);
    } else {
      callback(null);
    }
  });
}

// Assign ticket to agent
export async function assignTicket(
  ticketId: string,
  agentId: string,
  agentName: string
): Promise<TicketAssignmentResult> {
  try {
    const docRef = doc(db, 'tickets', ticketId);
    await updateDoc(docRef, {
      assignedTo: agentId,
      assignedToName: agentName,
      updatedAt: serverTimestamp(),
    });

    return {
      ticketId,
      assignedTo: agentId,
      assignedToName: agentName,
      success: true,
    };
  } catch (error: any) {
    return {
      ticketId,
      assignedTo: agentId,
      assignedToName: agentName,
      success: false,
      error: error.message,
    };
  }
}

// Bulk assign tickets
export async function bulkAssignTickets(
  ticketIds: string[],
  agentId: string,
  agentName: string
): Promise<BulkOperationResult> {
  const batch = writeBatch(db);
  const result: BulkOperationResult = {
    success: [],
    failed: [],
    errors: [],
  };

  for (const ticketId of ticketIds) {
    try {
      const docRef = doc(db, 'tickets', ticketId);
      batch.update(docRef, {
        assignedTo: agentId,
        assignedToName: agentName,
        updatedAt: serverTimestamp(),
      });
      result.success.push(ticketId);
    } catch (error: any) {
      result.failed.push(ticketId);
      result.errors.push({ ticketId, error: error.message });
    }
  }

  try {
    await batch.commit();
  } catch (error: any) {
    // If batch fails, mark all as failed
    result.failed = [...result.success, ...result.failed];
    result.success = [];
    result.errors.push({ ticketId: 'batch', error: error.message });
  }

  return result;
}

// Bulk update tickets (status, priority, category, tags)
export async function bulkUpdateTickets(
  payload: BulkUpdatePayload
): Promise<BulkOperationResult> {
  const batch = writeBatch(db);
  const result: BulkOperationResult = {
    success: [],
    failed: [],
    errors: [],
  };

  for (const ticketId of payload.ticketIds) {
    try {
      const docRef = doc(db, 'tickets', ticketId);
      batch.update(docRef, {
        ...payload.updates,
        updatedAt: serverTimestamp(),
      });
      result.success.push(ticketId);
    } catch (error: any) {
      result.failed.push(ticketId);
      result.errors.push({ ticketId, error: error.message });
    }
  }

  try {
    await batch.commit();
  } catch (error: any) {
    result.failed = [...result.success, ...result.failed];
    result.success = [];
    result.errors.push({ ticketId: 'batch', error: error.message });
  }

  return result;
}

// Update ticket status (admin can update any ticket)
export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
): Promise<void> {
  const docRef = doc(db, 'tickets', ticketId);
  const updates: any = {
    status,
    updatedAt: serverTimestamp(),
  };

  if (status === 'resolved') {
    updates.resolvedAt = serverTimestamp();
  } else if (status === 'closed') {
    updates.closedAt = serverTimestamp();
  }

  await updateDoc(docRef, updates);
}

// Update ticket priority
export async function updateTicketPriority(
  ticketId: string,
  priority: TicketPriority
): Promise<void> {
  const docRef = doc(db, 'tickets', ticketId);
  await updateDoc(docRef, {
    priority,
    updatedAt: serverTimestamp(),
  });
}

// Update ticket category
export async function updateTicketCategory(
  ticketId: string,
  category: TicketCategory
): Promise<void> {
  const docRef = doc(db, 'tickets', ticketId);
  await updateDoc(docRef, {
    category,
    updatedAt: serverTimestamp(),
  });
}

// Add internal note to ticket (admin only)
export async function addInternalNote(
  ticketId: string,
  note: string
): Promise<void> {
  const docRef = doc(db, 'tickets', ticketId);
  await updateDoc(docRef, {
    internalNotes: note,
    updatedAt: serverTimestamp(),
  });
}

// Delete ticket (admin only - use with caution)
export async function deleteTicket(ticketId: string): Promise<void> {
  const docRef = doc(db, 'tickets', ticketId);
  await deleteDoc(docRef);
}

// Bulk delete tickets (admin only - use with extreme caution)
export async function bulkDeleteTickets(
  ticketIds: string[]
): Promise<BulkOperationResult> {
  const batch = writeBatch(db);
  const result: BulkOperationResult = {
    success: [],
    failed: [],
    errors: [],
  };

  for (const ticketId of ticketIds) {
    try {
      const docRef = doc(db, 'tickets', ticketId);
      batch.delete(docRef);
      result.success.push(ticketId);
    } catch (error: any) {
      result.failed.push(ticketId);
      result.errors.push({ ticketId, error: error.message });
    }
  }

  try {
    await batch.commit();
  } catch (error: any) {
    result.failed = [...result.success, ...result.failed];
    result.success = [];
    result.errors.push({ ticketId: 'batch', error: error.message });
  }

  return result;
}

// Get tickets by agent (for agent performance tracking)
export async function getTicketsByAgent(agentId: string): Promise<Ticket[]> {
  const q = query(
    collection(db, 'tickets'),
    where('assignedTo', '==', agentId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Ticket[];
}

// Get unassigned tickets
export async function getUnassignedTickets(): Promise<Ticket[]> {
  const q = query(
    collection(db, 'tickets'),
    where('assignedTo', '==', null),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Ticket[];
}

// Get overdue tickets (no response within SLA)
export async function getOverdueTickets(slaHours: number = 24): Promise<Ticket[]> {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - slaHours);

  const q = query(
    collection(db, 'tickets'),
    where('status', 'in', ['open', 'in-progress']),
    where('createdAt', '<=', Timestamp.fromDate(cutoffTime)),
    orderBy('createdAt', 'asc')
  );

  const snapshot = await getDocs(q);
  const tickets = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Ticket[];

  // Filter for tickets without response
  return tickets.filter((ticket) => ticket.messageCount === 0);
}

// Get tickets requiring attention (high priority, unassigned, or overdue)
export async function getTicketsRequiringAttention(): Promise<{
  highPriority: Ticket[];
  unassigned: Ticket[];
  overdue: Ticket[];
}> {
  const [highPriority, unassigned, overdue] = await Promise.all([
    getAllTickets({ priority: ['high', 'urgent'], status: ['open', 'in-progress'] }),
    getUnassignedTickets(),
    getOverdueTickets(),
  ]);

  return {
    highPriority,
    unassigned,
    overdue,
  };
}

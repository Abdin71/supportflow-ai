// Firestore Service for Tickets - Real-time Operations

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc, 
  updateDoc,
  addDoc, 
  serverTimestamp,
  increment,
  Unsubscribe,
  getDocs
} from 'firebase/firestore';
import { db } from './config';
import type { Ticket, Message, TicketFilters } from './types';

/**
 * Subscribe to tickets with real-time updates
 * @param callback - Function to handle ticket updates
 * @param filters - Optional filters for status, category, etc.
 * @returns Unsubscribe function
 */
export function subscribeToTickets(
  callback: (tickets: Ticket[]) => void,
  filters: TicketFilters = {}
): Unsubscribe {
  const ticketsRef = collection(db, 'tickets');
  
  // Build query with filters
  let q = query(ticketsRef, orderBy('updatedAt', 'desc'));
  
  if (filters.status && filters.status !== 'all') {
    q = query(ticketsRef, where('status', '==', filters.status), orderBy('updatedAt', 'desc'));
  }
  
  if (filters.assignedTo) {
    q = query(ticketsRef, where('assignedTo', '==', filters.assignedTo), orderBy('updatedAt', 'desc'));
  }

  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Ticket));
    
    callback(tickets);
  }, (error) => {
    console.error('Error subscribing to tickets:', error);
  });
}

/**
 * Get a single ticket by ID
 */
export async function getTicket(ticketId: string): Promise<Ticket | null> {
  try {
    const docRef = doc(db, 'tickets', ticketId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Ticket;
    }
    return null;
  } catch (error) {
    console.error('Error getting ticket:', error);
    throw error;
  }
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  ticketId: string, 
  newStatus: Ticket['status']
): Promise<void> {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    await updateDoc(ticketRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
}

/**
 * Update ticket priority
 */
export async function updateTicketPriority(
  ticketId: string,
  priority: 'low' | 'medium' | 'high' | 'urgent'
): Promise<void> {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    await updateDoc(ticketRef, {
      priority,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating ticket priority:', error);
    throw error;
  }
}

/**
 * Assign ticket to an agent
 */
export async function assignTicket(
  ticketId: string,
  agentUid: string
): Promise<void> {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    await updateDoc(ticketRef, {
      assignedTo: agentUid,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error assigning ticket:', error);
    throw error;
  }
}

/**
 * Mark ticket as read (for agents)
 */
export async function markTicketAsRead(ticketId: string): Promise<void> {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    await updateDoc(ticketRef, {
      hasUnreadMessages: false,
    });
  } catch (error) {
    console.error('Error marking ticket as read:', error);
    throw error;
  }
}

/**
 * Subscribe to messages for a ticket
 */
export function subscribeToMessages(
  ticketId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('ticketId', '==', ticketId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message));
    
    callback(messages);
  }, (error) => {
    console.error('Error subscribing to messages:', error);
  });
}

/**
 * Send a reply to a ticket
 */
export async function sendReply(
  ticketId: string,
  text: string,
  agentData: { uid: string; email: string | null; displayName: string | null },
  isAiSuggestion: boolean = false
): Promise<void> {
  try {
    // 1. Add message to messages collection
    await addDoc(collection(db, 'messages'), {
      ticketId,
      text,
      userId: agentData.uid,
      userName: agentData.displayName || agentData.email || 'Agent',
      role: 'agent',
      isAiSuggestion,
      isEdited: false,
      createdAt: serverTimestamp(),
      editedAt: null,
    });

    // 2. Update ticket metadata
    const ticketRef = doc(db, 'tickets', ticketId);
    await updateDoc(ticketRef, {
      updatedAt: serverTimestamp(),
      messageCount: increment(1),
      hasUnreadMessages: true, // User has unread message from agent
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    throw error;
  }
}

/**
 * Get all agents (users with agent or admin role)
 */
export async function getAgents(): Promise<Array<{ uid: string; email: string; displayName?: string; role: string }>> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', 'in', ['agent', 'admin', 'manager']));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as { uid: string; email: string; displayName?: string; role: string }));
  } catch (error) {
    console.error('Error getting agents:', error);
    return [];
  }
}

/**
 * Get all users for customer selection
 */
export async function getUsers(): Promise<Array<{ uid: string; email: string; displayName?: string }>> {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      email: doc.data().email,
      displayName: doc.data().displayName
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
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
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  assignedTo?: string;
}): Promise<string> {
  try {
    const ticketsRef = collection(db, 'tickets');
    
    // Build ticket data, only include optional fields if they have values
    const ticketDoc: any = {
      subject: ticketData.subject,
      description: ticketData.description,
      status: 'open',
      userId: ticketData.userId,
      userEmail: ticketData.userEmail,
      userName: ticketData.userName,
      priority: ticketData.priority || 'medium',
      messageCount: 1, // Set to 1 immediately since we're adding initial message
      hasUnreadMessages: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Only add optional fields if they have values
    if (ticketData.category) {
      ticketDoc.category = ticketData.category;
    }
    if (ticketData.assignedTo) {
      ticketDoc.assignedTo = ticketData.assignedTo;
    }
    
    // Create ticket with correct messageCount from the start
    const docRef = await addDoc(ticketsRef, ticketDoc);
    
    // Add initial message (in try-catch to handle partial failures)
    try {
      await addDoc(collection(db, 'messages'), {
        ticketId: docRef.id,
        text: ticketData.description,
        userId: ticketData.userId,
        userName: ticketData.userName,
        role: 'user',
        isAiSuggestion: false,
        isEdited: false,
        createdAt: serverTimestamp(),
        editedAt: null
      });
    } catch (messageError) {
      console.error('Error creating initial message:', messageError);
      // Don't fail the entire operation if message creation fails
      // The ticket exists and can be accessed
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

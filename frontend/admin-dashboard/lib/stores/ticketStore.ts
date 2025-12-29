// Ticket Store - Real-time Zustand Store for Tickets

import { create } from 'zustand';
import type { Ticket, TicketFilters, SortOption } from '../firebase/types';
import { 
  subscribeToTickets, 
  updateTicketStatus, 
  updateTicketPriority,
  assignTicket,
  markTicketAsRead,
  sendReply,
  createTicket as createTicketFirebase
} from '../firebase/tickets';
import type { Unsubscribe } from 'firebase/firestore';

interface TicketState {
  // State
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  filters: TicketFilters;
  sortBy: SortOption;
  
  // Subscription
  unsubscribe: Unsubscribe | null;
  
  // Computed
  getFilteredAndSortedTickets: () => Ticket[];
  
  // Actions
  initialize: () => void;
  cleanup: () => void;
  setFilters: (filters: TicketFilters) => void;
  setSortBy: (sortBy: SortOption) => void;
  updateStatus: (ticketId: string, status: Ticket['status']) => Promise<void>;
  updatePriority: (ticketId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => Promise<void>;
  assignToAgent: (ticketId: string, agentUid: string) => Promise<void>;
  markAsRead: (ticketId: string) => Promise<void>;
  reply: (ticketId: string, text: string, agentData: { uid: string; email: string | null; displayName: string | null }, isAiSuggestion?: boolean) => Promise<void>;
  createTicket: (ticketData: {
    subject: string;
    description: string;
    userId: string;
    userEmail: string;
    userName: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: string;
    assignedTo?: string;
  }) => Promise<string>;
}

export const useTicketStore = create<TicketState>((set, get) => ({
  // Initial state
  tickets: [],
  loading: true,
  error: null,
  filters: { status: 'all' },
  sortBy: 'newest',
  unsubscribe: null,

  // Computed: Get filtered and sorted tickets
  getFilteredAndSortedTickets: () => {
    const { tickets, filters, sortBy } = get();
    
    // Apply client-side filters (category, priority, etc.)
    let filtered = tickets;
    
    // Filter by category (not handled by Firestore query)
    if (filters.category) {
      filtered = filtered.filter(ticket => 
        ticket.category?.toLowerCase() === filters.category?.toLowerCase()
      );
    }
    
    // Filter by priority if needed
    if (filters.priority) {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority);
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest': {
          const timeA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate().getTime() : new Date(a.createdAt as any).getTime();
          const timeB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().getTime() : new Date(b.createdAt as any).getTime();
          return timeB - timeA;
        }
        case 'oldest': {
          const timeA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate().getTime() : new Date(a.createdAt as any).getTime();
          const timeB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().getTime() : new Date(b.createdAt as any).getTime();
          return timeA - timeB;
        }
        case 'priority': {
          const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority || 'medium'] || 2) - (priorityOrder[b.priority || 'medium'] || 2);
        }
        case 'status': {
          const statusOrder = { open: 0, 'in-progress': 1, pending: 2, resolved: 3, closed: 4 };
          return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        }
        default:
          return 0;
      }
    });
    
    return sorted;
  },

  // Initialize real-time subscription
  initialize: () => {
    const { filters, unsubscribe } = get();
    
    // Cleanup existing subscription
    if (unsubscribe) {
      unsubscribe();
    }

    set({ loading: true, error: null });

    // Subscribe to tickets
    const unsub = subscribeToTickets(
      (tickets) => {
        set({ tickets, loading: false });
      },
      filters
    );

    set({ unsubscribe: unsub });
  },

  // Cleanup subscription
  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },

  // Set filters and re-initialize
  setFilters: (filters) => {
    set({ filters });
    get().cleanup();
    get().initialize();
  },

  // Set sort option
  setSortBy: (sortBy) => {
    set({ sortBy });
  },

  // Update ticket status
  updateStatus: async (ticketId, status) => {
    try {
      await updateTicketStatus(ticketId, status);
      // Real-time update will reflect automatically
    } catch (error) {
      console.error('Failed to update status:', error);
      set({ error: 'Failed to update ticket status' });
      throw error;
    }
  },

  // Update ticket priority
  updatePriority: async (ticketId, priority) => {
    try {
      await updateTicketPriority(ticketId, priority);
    } catch (error) {
      console.error('Failed to update priority:', error);
      set({ error: 'Failed to update ticket priority' });
      throw error;
    }
  },

  // Assign ticket to agent
  assignToAgent: async (ticketId, agentUid) => {
    try {
      await assignTicket(ticketId, agentUid);
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      set({ error: 'Failed to assign ticket' });
      throw error;
    }
  },

  // Mark ticket as read
  markAsRead: async (ticketId) => {
    try {
      await markTicketAsRead(ticketId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
      throw error;
    }
  },

  // Send reply
  reply: async (ticketId, text, agentData, isAiSuggestion = false) => {
    try {
      await sendReply(ticketId, text, agentData, isAiSuggestion);
    } catch (error) {
      console.error('Failed to send reply:', error);
      set({ error: 'Failed to send reply' });
      throw error;
    }
  },

  // Create new ticket with optimistic update
  createTicket: async (ticketData) => {
    try {
      // Create optimistic ticket for immediate UI feedback
      const optimisticTicket: Ticket = {
        id: `temp-${Date.now()}`, // Temporary ID
        subject: ticketData.subject,
        description: ticketData.description,
        status: 'open',
        priority: ticketData.priority || 'medium',
        userId: ticketData.userId,
        userEmail: ticketData.userEmail,
        userName: ticketData.userName,
        category: ticketData.category,
        assignedTo: ticketData.assignedTo,
        messageCount: 1,
        hasUnreadMessages: false,
        createdAt: new Date() as any, // Placeholder
        updatedAt: new Date() as any,
      };

      // Add optimistic ticket to state
      set((state) => ({
        tickets: [optimisticTicket, ...state.tickets],
      }));

      // Create actual ticket in Firestore
      const ticketId = await createTicketFirebase(ticketData);

      // Remove optimistic ticket (real one will come from subscription)
      set((state) => ({
        tickets: state.tickets.filter(t => t.id !== optimisticTicket.id),
      }));

      return ticketId;
    } catch (error) {
      console.error('Failed to create ticket:', error);
      
      // Remove optimistic ticket on error
      set((state) => ({
        tickets: state.tickets.filter(t => !t.id.startsWith('temp-')),
        error: 'Failed to create ticket',
      }));
      
      throw error;
    }
  },
}));

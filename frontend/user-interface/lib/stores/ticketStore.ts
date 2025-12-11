import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  subscribeToUserTickets,
  createTicket as createTicketFirestore,
  updateTicketStatus as updateTicketStatusFirestore,
  Ticket,
  TicketFilters,
} from '@/lib/firebase/tickets';
import { Timestamp } from 'firebase/firestore';

interface CreateTicketData {
  subject: string;
  description: string;
  userId: string;
  userEmail: string;
  userName: string;
}

interface TicketStore {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  
  // Actions
  initialize: (userId: string) => void;
  cleanup: () => void;
  createTicket: (data: CreateTicketData) => Promise<string>;
  updateStatus: (ticketId: string, status: 'open' | 'in-progress' | 'resolved' | 'closed') => Promise<void>;
  setError: (error: string | null) => void;
  
  // Client-side filtering methods
  getByStatus: (status: string) => Ticket[];
  getByPriority: (priority: string) => Ticket[];
  getByCategory: (category: string) => Ticket[];
  search: (searchTerm: string) => Ticket[];
}

export const useTicketStore = create<TicketStore>()(
  persist(
    (set, get) => ({
      tickets: [],
      loading: true,
      error: null,
      unsubscribe: null,

      // Simplified initialization - ONLY userId filter
      // All other filters done on client side
      initialize: (userId: string) => {
        const currentState = get();
        
        // If already subscribed to this user, don't re-subscribe
        if (currentState.unsubscribe) {
          return;
        }

        set({ loading: true });

        // SINGLE COMPOSITE INDEX: userId + createdAt
        // No status/priority/category filters - those are done client-side
        const newUnsubscribe = subscribeToUserTickets(
          userId,
          (tickets) => {
            set({ tickets, loading: false, error: null });
          }
        );

        set({ unsubscribe: newUnsubscribe });
      },

      cleanup: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
          unsubscribe();
          set({ unsubscribe: null, tickets: [], loading: false });
        }
      },

      // Client-side filtering methods
      getByStatus: (status: string) => {
        return get().tickets.filter(t => t.status === status);
      },

      getByPriority: (priority: string) => {
        return get().tickets.filter(t => t.priority === priority);
      },

      getByCategory: (category: string) => {
        return get().tickets.filter(t => t.category === category);
      },

      search: (searchTerm: string) => {
        const term = searchTerm.toLowerCase();
        return get().tickets.filter(t => 
          t.subject.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term)
        );
      },

      // Optimistic update for create
      createTicket: async (data: CreateTicketData) => {
        const tempId = `temp-${Date.now()}`;
        const now = new Date();
        
        const tempTicket: Ticket = {
          id: tempId,
          subject: data.subject,
          description: data.description,
          userId: data.userId,
          userEmail: data.userEmail,
          userName: data.userName,
          status: 'open',
          createdAt: now,
          updatedAt: now,
          messageCount: 0,
          hasUnreadMessages: false,
          aiMetadata: {
            processingStatus: 'pending',
            startedAt: now,
          },
        };

        // Add to store immediately (optimistic)
        set((state) => ({
          tickets: [tempTicket, ...state.tickets],
        }));

        try {
          // Create in Firestore
          const ticketId = await createTicketFirestore({
            subject: data.subject,
            description: data.description,
            userId: data.userId,
            userEmail: data.userEmail,
            userName: data.userName,
          });
          
          // Replace temp with real ticket (will come via subscription)
          // Remove temp ticket as real one will arrive via subscription
          set((state) => ({
            tickets: state.tickets.filter(t => t.id !== tempId),
          }));

          return ticketId;
        } catch (error) {
          // Rollback on error
          const errorMessage = error instanceof Error ? error.message : 'Failed to create ticket';
          set((state) => ({
            tickets: state.tickets.filter(t => t.id !== tempId),
            error: errorMessage,
          }));
          throw error;
        }
      },

      // Optimistic update for status
      updateStatus: async (ticketId: string, status: 'open' | 'in-progress' | 'resolved' | 'closed') => {
        const { tickets } = get();
        const oldTickets = [...tickets];

        // Update immediately (optimistic)
        set({
          tickets: tickets.map(t =>
            t.id === ticketId ? { ...t, status, updatedAt: new Date() } : t
          ),
        });

        try {
          await updateTicketStatusFirestore(ticketId, status);
        } catch (error) {
          // Rollback on error
          const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
          set({ tickets: oldTickets, error: errorMessage });
          throw error;
        }
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'ticket-store',
      // Only persist tickets, not subscriptions or loading states
      partialize: (state) => ({ 
        tickets: state.tickets,
      }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ticket, AdminTicketFilters, BulkUpdatePayload } from '../firebase/types';
import {
  getAllTickets,
  subscribeToAllTickets,
  assignTicket,
  bulkAssignTickets,
  bulkUpdateTickets,
  updateTicketStatus,
  updateTicketPriority,
  updateTicketCategory,
  addInternalNote,
  getTicketsRequiringAttention,
} from '../firebase/tickets';
import type { Unsubscribe } from 'firebase/firestore';

interface TicketStore {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  filters: AdminTicketFilters | null;
  subscription: Unsubscribe | null;
  
  // Initialization
  initialize: (filters?: AdminTicketFilters) => Promise<void>;
  cleanup: () => void;
  
  // Actions
  setFilters: (filters: AdminTicketFilters | null) => void;
  assignTicket: (ticketId: string, agentId: string, agentName: string) => Promise<void>;
  bulkAssign: (ticketIds: string[], agentId: string, agentName: string) => Promise<void>;
  bulkUpdate: (payload: BulkUpdatePayload) => Promise<void>;
  updateStatus: (ticketId: string, status: Ticket['status']) => Promise<void>;
  updatePriority: (ticketId: string, priority: Ticket['priority']) => Promise<void>;
  updateCategory: (ticketId: string, category: Ticket['category']) => Promise<void>;
  addNote: (ticketId: string, note: string) => Promise<void>;
  loadAttentionTickets: () => Promise<void>;
  
  // Selectors
  getTicketById: (id: string) => Ticket | undefined;
  getByStatus: (status: Ticket['status']) => Ticket[];
  getByPriority: (priority: Ticket['priority']) => Ticket[];
  getByAgent: (agentId: string) => Ticket[];
  getUnassigned: () => Ticket[];
  search: (query: string) => Ticket[];
}

export const useTicketStore = create<TicketStore>()(
  persist(
    (set, get) => ({
      tickets: [],
      loading: false,
      error: null,
      filters: null,
      subscription: null,

      initialize: async (filters?: AdminTicketFilters) => {
        const { subscription, cleanup } = get();
        
        // Cleanup existing subscription
        if (subscription) {
          subscription();
        }

        set({ loading: true, error: null, filters: filters || null });

        try {
          // Subscribe to real-time updates
          const unsubscribe = subscribeToAllTickets((tickets) => {
            set({ tickets, loading: false });
          }, filters);

          set({ subscription: unsubscribe });
        } catch (error: any) {
          set({ error: error.message, loading: false });
          console.error('Failed to initialize ticket store:', error);
        }
      },

      cleanup: () => {
        const { subscription } = get();
        if (subscription) {
          subscription();
          set({ subscription: null, tickets: [] });
        }
      },

      setFilters: (filters) => {
        set({ filters });
        get().initialize(filters || undefined);
      },

      assignTicket: async (ticketId, agentId, agentName) => {
        try {
          await assignTicket(ticketId, agentId, agentName);
          // Real-time subscription will update the ticket
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      bulkAssign: async (ticketIds, agentId, agentName) => {
        try {
          const result = await bulkAssignTickets(ticketIds, agentId, agentName);
          if (result.failed.length > 0) {
            set({ error: `Failed to assign ${result.failed.length} tickets` });
          }
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      bulkUpdate: async (payload) => {
        try {
          const result = await bulkUpdateTickets(payload);
          if (result.failed.length > 0) {
            set({ error: `Failed to update ${result.failed.length} tickets` });
          }
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      updateStatus: async (ticketId, status) => {
        try {
          await updateTicketStatus(ticketId, status);
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      updatePriority: async (ticketId, priority) => {
        try {
          await updateTicketPriority(ticketId, priority);
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      updateCategory: async (ticketId, category) => {
        try {
          await updateTicketCategory(ticketId, category);
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      addNote: async (ticketId, note) => {
        try {
          await addInternalNote(ticketId, note);
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      loadAttentionTickets: async () => {
        try {
          const attention = await getTicketsRequiringAttention();
          // Could store these separately if needed
          console.log('Tickets requiring attention:', attention);
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      // Selectors (client-side filtering)
      getTicketById: (id) => {
        return get().tickets.find((t) => t.id === id);
      },

      getByStatus: (status) => {
        return get().tickets.filter((t) => t.status === status);
      },

      getByPriority: (priority) => {
        return get().tickets.filter((t) => t.priority === priority);
      },

      getByAgent: (agentId) => {
        return get().tickets.filter((t) => t.assignedTo === agentId);
      },

      getUnassigned: () => {
        return get().tickets.filter((t) => !t.assignedTo);
      },

      search: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().tickets.filter(
          (t) =>
            t.subject.toLowerCase().includes(lowerQuery) ||
            t.description.toLowerCase().includes(lowerQuery) ||
            t.userEmail.toLowerCase().includes(lowerQuery) ||
            t.userName.toLowerCase().includes(lowerQuery)
        );
      },
    }),
    {
      name: 'admin-ticket-store',
      partialize: (state) => ({
        // Don't persist subscription or loading states
        filters: state.filters,
      }),
    }
  )
);

"use client"

import { useTicketStore } from '@/lib/stores/ticketStore';
import { TicketFilters } from '@/lib/firebase/tickets';

/**
 * Hook to get all tickets with optional filters
 * Store is automatically initialized by StoreProvider
 * Filters are applied client-side to minimize Firestore indexes
 */
export function useTickets(filters?: TicketFilters) {
  const store = useTicketStore();

  // Apply client-side filters
  let filteredTickets = store.tickets;

  if (filters?.status) {
    filteredTickets = store.getByStatus(filters.status);
  }

  if (filters?.priority) {
    filteredTickets = filteredTickets.filter(t => t.priority === filters.priority);
  }

  if (filters?.category) {
    filteredTickets = filteredTickets.filter(t => t.category === filters.category);
  }

  if (filters?.limit) {
    filteredTickets = filteredTickets.slice(0, filters.limit);
  }

  return { tickets: filteredTickets, loading: store.loading, error: store.error };
}

/**
 * Hook to get a single ticket by ID
 * Pulls from the Zustand store if available
 */
export function useTicket(ticketId: string | null) {
  const { tickets, loading } = useTicketStore();
  
  const ticket = ticketId 
    ? tickets.find(t => t.id === ticketId) || null
    : null;

  return { ticket, loading, error: null };
}

/**
 * Hook to get ticket statistics
 */
export function useTicketStats() {
  const { tickets, loading } = useTicketStore();

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  return { stats, loading };
}

/**
 * Hook to create a ticket with optimistic updates
 * Store is automatically initialized by StoreProvider
 */
export function useCreateTicket() {
  const createTicket = useTicketStore(state => state.createTicket);
  const loading = useTicketStore(state => state.loading);
  const error = useTicketStore(state => state.error);

  return { createTicket, creating: loading, error };
}

/**
 * Hook to update ticket status with optimistic updates
 */
export function useUpdateTicketStatus() {
  const { updateStatus, loading, error } = useTicketStore();

  return { updateStatus, updating: loading, error };
}

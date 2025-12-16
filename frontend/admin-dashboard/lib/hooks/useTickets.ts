"use client";

import { useTicketStore } from '../stores/ticketStore';
import type { AdminTicketFilters } from '../firebase/types';

/**
 * Hook to access all tickets with admin privileges
 * Store is automatically initialized by StoreProvider
 */
export function useTickets(filters?: AdminTicketFilters) {
  const tickets = useTicketStore((state) => state.tickets);
  const loading = useTicketStore((state) => state.loading);
  const error = useTicketStore((state) => state.error);
  const setFilters = useTicketStore((state) => state.setFilters);

  // Apply filters if provided
  if (filters) {
    setFilters(filters);
  }

  return { tickets, loading, error, setFilters };
}

export function useTicket(id: string | null) {
  const ticket = useTicketStore((state) =>
    id ? state.getTicketById(id) : undefined
  );
  const loading = useTicketStore((state) => state.loading);
  return { ticket, loading };
}

export function useTicketActions() {
  const assignTicket = useTicketStore((state) => state.assignTicket);
  const bulkAssign = useTicketStore((state) => state.bulkAssign);
  const bulkUpdate = useTicketStore((state) => state.bulkUpdate);
  const updateStatus = useTicketStore((state) => state.updateStatus);
  const updatePriority = useTicketStore((state) => state.updatePriority);
  const updateCategory = useTicketStore((state) => state.updateCategory);
  const addNote = useTicketStore((state) => state.addNote);

  return {
    assignTicket,
    bulkAssign,
    bulkUpdate,
    updateStatus,
    updatePriority,
    updateCategory,
    addNote,
  };
}

export function useTicketStats() {
  const tickets = useTicketStore((state) => state.tickets);
  const getByStatus = useTicketStore((state) => state.getByStatus);
  const getByPriority = useTicketStore((state) => state.getByPriority);
  const getUnassigned = useTicketStore((state) => state.getUnassigned);

  return {
    total: tickets.length,
    open: getByStatus('open').length,
    inProgress: getByStatus('in-progress').length,
    pending: getByStatus('pending').length,
    resolved: getByStatus('resolved').length,
    closed: getByStatus('closed').length,
    highPriority: getByPriority('high').length + getByPriority('urgent').length,
    unassigned: getUnassigned().length,
  };
}

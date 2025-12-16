"use client";

import { useEffect } from 'react';
import { useMessageStore } from '../stores/messageStore';

/**
 * Hook to get messages for a specific ticket
 * Subscribes to real-time updates
 */
export function useMessages(ticketId: string | null) {
  const messagesByTicket = useMessageStore((state) => state.messagesByTicket);
  const loading = useMessageStore((state) => state.loading);
  const error = useMessageStore((state) => state.error);
  const initializeTicket = useMessageStore((state) => state.initializeTicket);
  const cleanupTicket = useMessageStore((state) => state.cleanupTicket);

  useEffect(() => {
    if (!ticketId) return;

    initializeTicket(ticketId);

    return () => {
      cleanupTicket(ticketId);
    };
  }, [ticketId, initializeTicket, cleanupTicket]);

  return {
    messages: ticketId ? messagesByTicket[ticketId] || [] : [],
    loading: ticketId ? loading[ticketId] || false : false,
    error: ticketId ? error[ticketId] : null,
  };
}

export function useMessageActions() {
  const addMessage = useMessageStore((state) => state.addMessage);
  const updateMessage = useMessageStore((state) => state.updateMessage);
  const deleteMessage = useMessageStore((state) => state.deleteMessage);

  return { addMessage, updateMessage, deleteMessage };
}

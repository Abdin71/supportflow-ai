"use client"

import { useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useMessageStore } from '@/lib/stores/messageStore';
import { canEditMessage } from '@/lib/firebase/messages';

/**
 * Hook to get messages for a specific ticket
 * Uses Zustand store to prevent duplicate Firestore subscriptions
 */
export function useMessages(ticketId: string | null) {
  const { messagesByTicket, loading, error, initializeTicket } = useMessageStore();

  useEffect(() => {
    if (!ticketId) {
      return;
    }

    // Initialize subscription for this ticket
    // Store prevents duplicates automatically
    initializeTicket(ticketId);

    // Note: Cleanup is handled by StoreProvider on unmount/logout
  }, [ticketId, initializeTicket]);

  const messages = ticketId ? (messagesByTicket[ticketId] || []) : [];
  const isLoading = ticketId ? (loading[ticketId] ?? true) : false;

  return { messages, loading: isLoading, error };
}

/**
 * Hook to add a message to a ticket with optimistic updates
 */
export function useAddMessage(ticketId: string) {
  const { user } = useAuth();
  const { addMessage, loading, error } = useMessageStore();

  const add = async (text: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    return addMessage({
      ticketId,
      text,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      role: 'user',
    });
  };

  const isAdding = loading[ticketId] ?? false;

  return { addMessage: add, adding: isAdding, error };
}

/**
 * Hook to update a message with optimistic updates
 */
export function useUpdateMessage(ticketId: string) {
  const { updateMessage, loading, error } = useMessageStore();

  const update = async (messageId: string, text: string) => {
    return updateMessage(ticketId, messageId, text);
  };

  const isUpdating = loading[ticketId] ?? false;

  return { updateMessage: update, updating: isUpdating, error };
}

export { canEditMessage };

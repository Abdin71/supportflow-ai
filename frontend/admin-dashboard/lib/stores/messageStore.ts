import { create } from 'zustand';
import type { Message } from '../firebase/types';
import {
  subscribeToTicketMessages,
  addMessage,
  updateMessage,
  deleteMessage,
} from '../firebase/messages';
import type { Unsubscribe } from 'firebase/firestore';

interface MessageState {
  messagesByTicket: Record<string, Message[]>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  subscriptions: Record<string, Unsubscribe>;
}

interface MessageActions {
  initializeTicket: (ticketId: string) => void;
  cleanupTicket: (ticketId: string) => void;
  cleanupAll: () => void;
  addMessage: (ticketId: string, userId: string, userEmail: string, userName: string, text: string, isInternal?: boolean) => Promise<string>;
  updateMessage: (messageId: string, text: string) => Promise<void>;
  deleteMessage: (messageId: string, ticketId: string) => Promise<void>;
}

type MessageStore = MessageState & MessageActions;

export const useMessageStore = create<MessageStore>()((set, get) => ({
  messagesByTicket: {},
  loading: {},
  error: {},
  subscriptions: {},

  initializeTicket: (ticketId: string) => {
    const { subscriptions, cleanupTicket } = get();

    if (subscriptions[ticketId]) {
      return;
    }

    set((state) => ({
      loading: { ...state.loading, [ticketId]: true },
      error: { ...state.error, [ticketId]: null },
    }));

    const unsubscribe = subscribeToTicketMessages(ticketId, (messages) => {
      set((state) => ({
        messagesByTicket: { ...state.messagesByTicket, [ticketId]: messages },
        loading: { ...state.loading, [ticketId]: false },
      }));
    });

    set((state) => ({
      subscriptions: { ...state.subscriptions, [ticketId]: unsubscribe },
    }));
  },

  cleanupTicket: (ticketId: string) => {
    const { subscriptions } = get();
    const unsubscribe = subscriptions[ticketId];
    
    if (unsubscribe) {
      unsubscribe();
      
      set((state) => {
        const newSubscriptions = { ...state.subscriptions };
        delete newSubscriptions[ticketId];
        
        const newMessages = { ...state.messagesByTicket };
        delete newMessages[ticketId];
        
        return { subscriptions: newSubscriptions, messagesByTicket: newMessages };
      });
    }
  },

  cleanupAll: () => {
    const { subscriptions } = get();
    Object.values(subscriptions).forEach((unsubscribe) => unsubscribe());
    set({ subscriptions: {}, messagesByTicket: {} });
  },

  addMessage: async (ticketId, userId, userEmail, userName, text, isInternal = false) => {
    try {
      return await addMessage(ticketId, userId, userEmail, userName, text, isInternal);
    } catch (error: any) {
      set((state) => ({
        error: { ...state.error, [ticketId]: error.message },
      }));
      throw error;
    }
  },

  updateMessage: async (messageId, text) => {
    try {
      await updateMessage(messageId, text);
    } catch (error: any) {
      console.error('Failed to update message:', error);
      throw error;
    }
  },

  deleteMessage: async (messageId, ticketId) => {
    try {
      await deleteMessage(messageId);
    } catch (error: any) {
      set((state) => ({
        error: { ...state.error, [ticketId]: error.message },
      }));
      throw error;
    }
  },
}));

import { create } from 'zustand';
import {
  subscribeToMessages,
  addMessage as addMessageFirestore,
  updateMessage as updateMessageFirestore,
  Message,
} from '@/lib/firebase/messages';

interface AddMessageData {
  ticketId: string;
  text: string;
  userId: string;
  userName: string;
  role: 'user' | 'agent';
}

interface MessageStore {
  messagesByTicket: Record<string, Message[]>;
  loading: Record<string, boolean>;
  error: string | null;
  subscriptions: Record<string, () => void>;
  
  // Actions
  initializeTicket: (ticketId: string) => void;
  cleanupTicket: (ticketId: string) => void;
  cleanupAll: () => void;
  addMessage: (data: AddMessageData) => Promise<string>;
  updateMessage: (ticketId: string, messageId: string, text: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messagesByTicket: {},
  loading: {},
  error: null,
  subscriptions: {},

  // Initialize subscription for a specific ticket
  initializeTicket: (ticketId: string) => {
    const { subscriptions, messagesByTicket } = get();
    
    // If already subscribed, don't re-subscribe
    if (subscriptions[ticketId]) {
      return;
    }

    // Set loading state
    set((state) => ({
      loading: { ...state.loading, [ticketId]: true },
    }));

    // Create subscription
    const unsubscribe = subscribeToMessages(ticketId, (messages) => {
      set((state) => ({
        messagesByTicket: { ...state.messagesByTicket, [ticketId]: messages },
        loading: { ...state.loading, [ticketId]: false },
      }));
    });

    set((state) => ({
      subscriptions: { ...state.subscriptions, [ticketId]: unsubscribe },
    }));
  },

  // Cleanup subscription for a specific ticket
  cleanupTicket: (ticketId: string) => {
    const { subscriptions } = get();
    const unsubscribe = subscriptions[ticketId];
    
    if (unsubscribe) {
      unsubscribe();
      
      set((state) => {
        const newSubscriptions = { ...state.subscriptions };
        const newMessagesByTicket = { ...state.messagesByTicket };
        const newLoading = { ...state.loading };
        
        delete newSubscriptions[ticketId];
        delete newMessagesByTicket[ticketId];
        delete newLoading[ticketId];
        
        return {
          subscriptions: newSubscriptions,
          messagesByTicket: newMessagesByTicket,
          loading: newLoading,
        };
      });
    }
  },

  // Cleanup all subscriptions
  cleanupAll: () => {
    const { subscriptions } = get();
    
    Object.values(subscriptions).forEach(unsubscribe => unsubscribe());
    
    set({
      subscriptions: {},
      messagesByTicket: {},
      loading: {},
    });
  },

  // Optimistic add message
  addMessage: async (data: AddMessageData) => {
    const tempId = `temp-${Date.now()}`;
    const now = new Date();
    
    const tempMessage: Message = {
      id: tempId,
      ticketId: data.ticketId,
      text: data.text,
      userId: data.userId,
      userName: data.userName,
      role: data.role,
      createdAt: now,
      isEdited: false,
    };

    // Add to store immediately (optimistic)
    set((state) => ({
      messagesByTicket: {
        ...state.messagesByTicket,
        [data.ticketId]: [
          ...(state.messagesByTicket[data.ticketId] || []),
          tempMessage,
        ],
      },
    }));

    try {
      // Create in Firestore
      const messageId = await addMessageFirestore({
        ticketId: data.ticketId,
        text: data.text,
        userId: data.userId,
        userName: data.userName,
        role: data.role,
      });
      
      // Remove temp message (real one will arrive via subscription)
      set((state) => ({
        messagesByTicket: {
          ...state.messagesByTicket,
          [data.ticketId]: (state.messagesByTicket[data.ticketId] || []).filter(
            m => m.id !== tempId
          ),
        },
      }));

      return messageId;
    } catch (error) {
      // Rollback on error
      const errorMessage = error instanceof Error ? error.message : 'Failed to add message';
      set((state) => ({
        messagesByTicket: {
          ...state.messagesByTicket,
          [data.ticketId]: (state.messagesByTicket[data.ticketId] || []).filter(
            m => m.id !== tempId
          ),
        },
        error: errorMessage,
      }));
      throw error;
    }
  },

  // Optimistic update message
  updateMessage: async (ticketId: string, messageId: string, text: string) => {
    const { messagesByTicket } = get();
    const oldMessages = [...(messagesByTicket[ticketId] || [])];

    // Update immediately (optimistic)
    set((state) => ({
      messagesByTicket: {
        ...state.messagesByTicket,
        [ticketId]: (state.messagesByTicket[ticketId] || []).map(m =>
          m.id === messageId
            ? { ...m, text, isEdited: true, editedAt: new Date() }
            : m
        ),
      },
    }));

    try {
      await updateMessageFirestore(ticketId, messageId, text);
    } catch (error) {
      // Rollback on error
      const errorMessage = error instanceof Error ? error.message : 'Failed to update message';
      set((state) => ({
        messagesByTicket: {
          ...state.messagesByTicket,
          [ticketId]: oldMessages,
        },
        error: errorMessage,
      }));
      throw error;
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

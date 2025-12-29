// Message Store - Real-time Zustand Store for Ticket Messages

import { create } from 'zustand';
import type { Message } from '../firebase/types';
import { subscribeToMessages, sendReply } from '../firebase/tickets';
import type { Unsubscribe } from 'firebase/firestore';

interface MessageState {
  // State - organized by ticketId
  messagesByTicket: Record<string, Message[]>;
  loading: Record<string, boolean>;
  
  // Subscriptions - track by ticketId
  subscriptions: Record<string, Unsubscribe>;
  
  // Actions
  subscribeToTicket: (ticketId: string) => void;
  unsubscribeFromTicket: (ticketId: string) => void;
  cleanup: () => void;
  getMessages: (ticketId: string) => Message[];
  addMessage: (ticketId: string, messageData: {
    text: string;
    userId: string;
    userName: string;
    role: 'user' | 'agent';
    isAiSuggestion: boolean;
  }) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  // Initial state
  messagesByTicket: {},
  loading: {},
  subscriptions: {},

  // Subscribe to messages for a specific ticket
  subscribeToTicket: (ticketId: string) => {
    const { subscriptions } = get();
    
    // Don't subscribe if already subscribed
    if (subscriptions[ticketId]) {
      return;
    }

    // Set loading state
    set((state) => ({
      loading: { ...state.loading, [ticketId]: true }
    }));

    // Subscribe to messages
    const unsubscribe = subscribeToMessages(ticketId, (messages) => {
      set((state) => ({
        messagesByTicket: { ...state.messagesByTicket, [ticketId]: messages },
        loading: { ...state.loading, [ticketId]: false }
      }));
    });

    // Store unsubscribe function
    set((state) => ({
      subscriptions: { ...state.subscriptions, [ticketId]: unsubscribe }
    }));
  },

  // Unsubscribe from a specific ticket
  unsubscribeFromTicket: (ticketId: string) => {
    const { subscriptions } = get();
    
    if (subscriptions[ticketId]) {
      subscriptions[ticketId]();
      
      // Remove subscription and data
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
          loading: newLoading
        };
      });
    }
  },

  // Cleanup all subscriptions
  cleanup: () => {
    const { subscriptions } = get();
    
    Object.values(subscriptions).forEach(unsubscribe => unsubscribe());
    
    set({
      subscriptions: {},
      messagesByTicket: {},
      loading: {}
    });
  },

  // Get messages for a ticket (convenience method)
  getMessages: (ticketId: string) => {
    return get().messagesByTicket[ticketId] || [];
  },

  // Add a new message (send reply)
  addMessage: async (ticketId: string, messageData) => {
    const agentData = {
      uid: messageData.userId,
      email: null,
      displayName: messageData.userName
    };
    await sendReply(ticketId, messageData.text, agentData, messageData.isAiSuggestion);
    // Real-time subscription will update the UI automatically
  }
}));

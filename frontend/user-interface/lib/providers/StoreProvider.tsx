"use client"

import { useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useTicketStore } from '@/lib/stores/ticketStore';
import { useMessageStore } from '@/lib/stores/messageStore';

/**
 * Provider that initializes stores based on authentication state
 * Handles subscription lifecycle for Firestore real-time updates
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      // Initialize ticket store subscription
      const ticketStore = useTicketStore.getState();
      ticketStore.initialize(user.uid);
      
      console.log('[StoreProvider] Initialized ticket store for user:', user.uid);
    } else {
      // Cleanup when user logs out
      const ticketStore = useTicketStore.getState();
      ticketStore.cleanup();
      
      const messageStore = useMessageStore.getState();
      messageStore.cleanupAll();
      
      console.log('[StoreProvider] Cleaned up stores - user logged out');
    }
    
    // Cleanup on unmount
    return () => {
      const ticketStore = useTicketStore.getState();
      const messageStore = useMessageStore.getState();
      
      ticketStore.cleanup();
      messageStore.cleanupAll();
      
      console.log('[StoreProvider] Cleaned up stores on unmount');
    };
  }, [user?.uid]);
  
  return <>{children}</>;
}

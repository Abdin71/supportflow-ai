"use client";

import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useTicketStore } from '../stores/ticketStore';
import { useMessageStore } from '../stores/messageStore';
import { useUserStore } from '../stores/userStore';

/**
 * StoreProvider - Centralized initialization for admin stores
 * Manages lifecycle of real-time Firestore subscriptions
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuthStore();
  const isAuthenticated = !!user;

  useEffect(() => {
    if (user && isAuthenticated) {
      // Initialize all stores when admin logs in
      const ticketStore = useTicketStore.getState();
      const userStore = useUserStore.getState();

      // Initialize ticket subscription (all tickets for admin)
      ticketStore.initialize();
      
      // Initialize user subscription (all users)
      userStore.initialize();
      
      // Load agents for dropdown/assignment
      userStore.loadAgents();

      console.log('[StoreProvider] Initialized stores for admin:', user.email);

      return () => {
        // Cleanup on logout
        ticketStore.cleanup();
        userStore.cleanup();
        useMessageStore.getState().cleanupAll();
        
        console.log('[StoreProvider] Cleaned up stores');
      };
    }
  }, [user?.uid, isAuthenticated]);

  return <>{children}</>;
}

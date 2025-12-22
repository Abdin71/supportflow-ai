"use client";

import { useEffect } from 'react';
import { useAuthStore } from '../../lib/stores/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  return <>{children}</>;
}

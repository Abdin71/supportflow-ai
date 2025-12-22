"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/stores/authStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'agent' | 'manager';
}

export function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const { user, role, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (requiredRole && role !== requiredRole && role !== 'admin') {
        // Admin has access to everything, otherwise check specific role
        router.push('/'); 
      } else if (role === 'user') {
         // Regular users shouldn't be in admin dashboard
         window.location.href = 'http://localhost:3001'; 
      }
    }
  }, [user, role, loading, router, requiredRole]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return null;
  }
  
  if (role === 'user') {
    return null;
  }

  return <>{children}</>;
}

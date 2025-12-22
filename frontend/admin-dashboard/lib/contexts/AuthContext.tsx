"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { User, UserRole, AdminPermissions } from '../firebase/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isAgent: boolean;
  hasPermission: (permission: keyof AdminPermissions) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[AuthContext] Setting up auth state listener...');
    const startTime = Date.now();
    
    // Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const authCheckTime = Date.now() - startTime;
      console.log(`[AuthContext] Auth state changed (${authCheckTime}ms)`, {
        authenticated: !!firebaseUser,
        email: firebaseUser?.email,
        uid: firebaseUser?.uid,
      });
      
      if (firebaseUser) {
        // Get user document from Firestore to get role and permissions
        console.log('[AuthContext] Fetching Firestore user document...');
        const firestoreStartTime = Date.now();
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Force fetch from server to avoid stale cache issues
        let userDoc;
        try {
          userDoc = await getDocFromServer(userDocRef);
          console.log('[AuthContext] Fetched from server');
        } catch (e) {
          console.warn('[AuthContext] Server fetch failed, falling back to default fetch', e);
          userDoc = await getDoc(userDocRef);
        }

        const firestoreFetchTime = Date.now() - firestoreStartTime;
        
        console.log(`[AuthContext] Firestore fetch complete (${firestoreFetchTime}ms)`, {
          exists: userDoc.exists(),
          docId: userDoc.id,
          fromCache: userDoc.metadata.fromCache,
        });
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const isCached = userDoc.metadata.fromCache;
          
          console.log('[AuthContext] Raw Firestore data:', JSON.stringify(userData, null, 2));
          
          console.log('[AuthContext] User data retrieved:', {
            uid: userData.uid,
            email: userData.email,
            role: userData.role || '❌ MISSING',
            isActive: userData.isActive,
            hasPermissions: !!userData.permissions,
            totalLoadTime: `${Date.now() - startTime}ms`,
            source: isCached ? 'CACHE' : 'SERVER',
            firebaseUid: firebaseUser.uid
          });

          if (isCached) {
            console.warn('[AuthContext] ⚠️ Data fetched from local cache. If this data is missing fields, please CLEAR YOUR BROWSER STORAGE (Application > Clear Site Data).');
          }
          
          // Check if role field exists
          if (!userData.role) {
            console.error(
              `[AuthContext] ❌ Access denied: User document exists but has no "role" field. User: ${firebaseUser.email} (UID: ${firebaseUser.uid})`
            );
            console.log('[AuthContext] 💡 Fix options:');
            console.log('   1. Run: cd backend && npm run create-admin', firebaseUser.email, 'YourPassword "Your Name"');
            console.log('   2. Manually add role field in Firebase Console > Firestore > users collection');
            console.log('[AuthContext] Signing out user...');
            await firebaseSignOut(auth);
            setUser(null);
            setLoading(false);
            return;
          }
          
          // Check if user has admin-level access
          const hasAdminAccess = ['admin', 'manager', 'agent'].includes(userData.role);
          
          console.log(`[AuthContext] Role check:`, {
            role: userData.role,
            hasAdminAccess,
            requiredRoles: ['admin', 'manager', 'agent'],
          });
          
          if (!hasAdminAccess) {
            // User doesn't have admin dashboard access
            console.error(
              `[AuthContext] ❌ Access denied: User has role "${userData.role}" but admin dashboard requires "admin", "manager", or "agent" role.`
            );
            console.log('[AuthContext] 💡 To upgrade this user to admin, run:');
            console.log(`   cd backend && npm run create-admin ${firebaseUser.email} YourPassword "${firebaseUser.displayName || 'Admin User'}"`);
            console.log('[AuthContext] Signing out user...');
            await firebaseSignOut(auth);
            setUser(null);
            setLoading(false);
            return;
          }
          
          console.log('[AuthContext] ✅ Access granted - setting user state');
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: userData.role as UserRole,
            permissions: userData.permissions,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            lastLoginAt: userData.lastLoginAt,
            isActive: userData.isActive,
            department: userData.department,
            teamId: userData.teamId,
          });
        } else {
          // User document doesn't exist
          console.error('[AuthContext] ❌ User document not found in Firestore');
          console.log('[AuthContext] 💡 If this is a new Firebase Auth user, create their Firestore document or use the create-admin script');
          console.log('[AuthContext] Signing out user...');
          await firebaseSignOut(auth);
          setUser(null);
        }
      } else {
        console.log('[AuthContext] No authenticated user');
        setUser(null)
      }
      
      const totalTime = Date.now() - startTime;
      console.log(`[AuthContext] Loading complete (${totalTime}ms) - loading state set to false`);
      setLoading(false)
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth listener');
      unsubscribe();
    };
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('[AuthContext] Sign in attempt:', email);
    const signInStart = Date.now();
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(`[AuthContext] Firebase Auth sign in successful (${Date.now() - signInStart}ms)`);
      
      // Update last login time
      const updateStart = Date.now();
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
      }, { merge: true });
      console.log(`[AuthContext] Last login timestamp updated (${Date.now() - updateStart}ms)`);
    } catch (error: any) {
      console.error('[AuthContext] ❌ Sign in error:', error.code, error.message);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  const signOut = async () => {
    console.log('[AuthContext] Sign out initiated');
    try {
      await firebaseSignOut(auth);
      setUser(null);
      console.log('[AuthContext] ✅ Sign out successful');
    } catch (error: any) {
      console.error('[AuthContext] ❌ Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }

  // Permission helpers
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;
  const isAgent = user?.role === 'agent' || isManager;

  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin has all permissions
    return user.permissions?.[permission] || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        resetPassword,
        isAuthenticated: !!user,
        isAdmin,
        isManager,
        isAgent,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


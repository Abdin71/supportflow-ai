import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  firebaseSignOut, 
  onAuthStateChanged,
  mapFirebaseUserToUser
} from '../firebase/auth';
import { auth } from '../firebase/config';
import type { User, UserRole } from '../firebase/types';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => () => void; // Returns unsubscribe function
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  loading: true,
  error: null,

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // State update will happen in onAuthStateChanged listener
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signUp: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // State update will happen in onAuthStateChanged listener
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await firebaseSignOut(auth);
      set({ user: null, role: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  initializeAuth: () => {
    set({ loading: true });
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await mapFirebaseUserToUser(firebaseUser);
          
          if (user) {
            set({ 
              user, 
              role: user.role, 
              loading: false, 
              error: null 
            });
          } else {
            // User exists in Auth but not in Firestore (or error fetching)
            set({ 
              user: null, 
              role: null, 
              loading: false, 
              error: 'User profile not found' 
            });
          }
        } catch (error: any) {
          set({ 
            user: null, 
            role: null, 
            loading: false, 
            error: error.message 
          });
        }
      } else {
        set({ 
          user: null, 
          role: null, 
          loading: false, 
          error: null 
        });
      }
    });

    return unsubscribe;
  },
}));

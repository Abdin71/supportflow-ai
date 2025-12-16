import { create } from 'zustand';
import type { User, UserRole } from '../firebase/types';
import {
  getAllUsers,
  subscribeToAllUsers,
  getUsersByRole,
  updateUserRole,
  updateUserActiveStatus,
  getActiveAgents,
} from '../firebase/users';
import type { Unsubscribe } from 'firebase/firestore';

interface UserStore {
  users: User[];
  agents: User[];
  loading: boolean;
  error: string | null;
  subscription: Unsubscribe | null;

  initialize: () => Promise<void>;
  cleanup: () => void;
  loadAgents: () => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  toggleUserActive: (userId: string, isActive: boolean) => Promise<void>;
  getUserById: (userId: string) => User | undefined;
  getUsersByRole: (role: UserRole) => User[];
}

export const useUserStore = create<UserStore>()((set, get) => ({
  users: [],
  agents: [],
  loading: false,
  error: null,
  subscription: null,

  initialize: async () => {
    const { subscription } = get();

    if (subscription) {
      subscription();
    }

    set({ loading: true, error: null });

    try {
      const unsubscribe = subscribeToAllUsers((users) => {
        set({ users, loading: false });
      });

      set({ subscription: unsubscribe });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  cleanup: () => {
    const { subscription } = get();
    if (subscription) {
      subscription();
      set({ subscription: null, users: [], agents: [] });
    }
  },

  loadAgents: async () => {
    try {
      const agents = await getActiveAgents();
      set({ agents });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      await updateUserRole(userId, role);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  toggleUserActive: async (userId, isActive) => {
    try {
      await updateUserActiveStatus(userId, isActive);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  getUserById: (userId) => {
    return get().users.find((u) => u.uid === userId);
  },

  getUsersByRole: (role) => {
    return get().users.filter((u) => u.role === role);
  },
}));

"use client";

import { useUserStore } from '../stores/userStore';

export function useUsers() {
  const users = useUserStore((state) => state.users);
  const loading = useUserStore((state) => state.loading);
  const error = useUserStore((state) => state.error);

  return { users, loading, error };
}

export function useAgents() {
  const agents = useUserStore((state) => state.agents);
  const loadAgents = useUserStore((state) => state.loadAgents);

  return { agents, loadAgents };
}

export function useUserActions() {
  const updateUserRole = useUserStore((state) => state.updateUserRole);
  const toggleUserActive = useUserStore((state) => state.toggleUserActive);

  return { updateUserRole, toggleUserActive };
}

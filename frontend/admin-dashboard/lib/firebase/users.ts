import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { User, UserRole, AdminPermissions } from './types';

/**
 * ADMIN USER MANAGEMENT OPERATIONS
 */

// Get all users
export async function getAllUsers(): Promise<User[]> {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as User[];
}

// Subscribe to real-time user updates
export function subscribeToAllUsers(
  callback: (users: User[]) => void
): Unsubscribe {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
    callback(users);
  });
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    uid: docSnap.id,
    ...docSnap.data(),
  } as User;
}

// Get users by role
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  const q = query(
    collection(db, 'users'),
    where('role', '==', role),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  })) as User[];
}

// Get all agents (admin, manager, agent roles)
export async function getAllAgents(): Promise<User[]> {
  const q = query(
    collection(db, 'users'),
    where('role', 'in', ['admin', 'manager', 'agent']),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  })) as User[];
}

// Update user role (admin only)
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<void> {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    role,
    updatedAt: serverTimestamp(),
  });
}

// Update user permissions (admin only)
export async function updateUserPermissions(
  userId: string,
  permissions: AdminPermissions
): Promise<void> {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    permissions,
    updatedAt: serverTimestamp(),
  });
}

// Activate/Deactivate user (admin only)
export async function updateUserActiveStatus(
  userId: string,
  isActive: boolean
): Promise<void> {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    isActive,
    updatedAt: serverTimestamp(),
  });
}

// Update user profile (admin can update any user)
export async function updateUserProfile(
  userId: string,
  updates: {
    displayName?: string;
    photoURL?: string;
    department?: string;
    teamId?: string;
  }
): Promise<void> {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Delete user (admin only - use with caution)
export async function deleteUser(userId: string): Promise<void> {
  const docRef = doc(db, 'users', userId);
  await deleteDoc(docRef);
  
  // Note: This only deletes the Firestore document
  // You'll need Firebase Admin SDK or Cloud Function to delete auth account
}

// Get active agents (for assignment)
export async function getActiveAgents(): Promise<User[]> {
  const q = query(
    collection(db, 'users'),
    where('role', 'in', ['admin', 'manager', 'agent']),
    where('isActive', '==', true),
    orderBy('displayName', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  })) as User[];
}

// Check if user has admin permissions
export async function checkAdminPermissions(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  
  if (!user) return false;
  
  return ['admin', 'manager'].includes(user.role);
}

// Get user statistics
export async function getUserStats(userId: string): Promise<{
  totalTickets: number;
  activeTickets: number;
  resolvedTickets: number;
  averageResponseTime: number;
}> {
  // This would typically aggregate ticket data for the user
  // Placeholder implementation - in production, use aggregation
  const ticketsQuery = query(
    collection(db, 'tickets'),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(ticketsQuery);
  const tickets = snapshot.docs.map((doc) => doc.data());
  
  return {
    totalTickets: tickets.length,
    activeTickets: tickets.filter((t: any) => 
      ['open', 'in-progress'].includes(t.status)
    ).length,
    resolvedTickets: tickets.filter((t: any) => 
      t.status === 'resolved'
    ).length,
    averageResponseTime: 0, // Calculate from ticket data
  };
}

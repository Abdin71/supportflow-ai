// Admin Dashboard Types - Aligned with Firestore Schema

import { Timestamp } from 'firebase/firestore';

// Core Ticket Type
export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
  userEmail: string;
  userName: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  messageCount: number;
  hasUnreadMessages: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  assignedTo?: string; // Agent uid
  aiMetadata?: AIMetadata;
}

export interface AIMetadata {
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  category?: string;
  suggestedPriority?: 'low' | 'medium' | 'high' | 'urgent';
  error?: string;
}

// Message Type
export interface Message {
  id: string;
  ticketId: string;
  text: string;
  userId: string;
  userName: string;
  role: 'user' | 'agent';
  isAiSuggestion: boolean;
  isEdited: boolean;
  createdAt: Timestamp;
  editedAt?: Timestamp | null;
}

// User Type (from AuthContext)
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'admin' | 'manager' | 'agent' | 'user';
}

// Filter and Query Types
export interface TicketFilters {
  status?: string;
  category?: string;
  assignedTo?: string;
  searchQuery?: string;
  priority?: string;
}

export type SortOption = 'newest' | 'oldest' | 'priority' | 'status';

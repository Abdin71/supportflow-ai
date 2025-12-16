import { Timestamp } from 'firebase/firestore';

// Admin role types
export type UserRole = 'admin' | 'manager' | 'agent' | 'user';

export interface AdminPermissions {
  canViewAllTickets: boolean;
  canEditAllTickets: boolean;
  canDeleteTickets: boolean;
  canManageUsers: boolean;
  canAccessAnalytics: boolean;
  canManageSettings: boolean;
  canBulkOperations: boolean;
}

// Extended user type with admin fields
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  permissions?: AdminPermissions;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  isActive: boolean;
  department?: string;
  teamId?: string;
}

// Ticket types
export type TicketStatus = 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'technical' | 'billing' | 'general' | 'feature-request' | 'bug';

export interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  assignedTo?: string; // Admin/agent uid
  assignedToName?: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  tags: string[];
  aiMetadata: {
    processingStatus: 'pending' | 'completed' | 'failed';
    suggestedCategory?: TicketCategory;
    suggestedPriority?: TicketPriority;
    suggestedTags?: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
    confidence?: number;
    processedAt?: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
  closedAt?: Timestamp;
  responseTime?: number; // Time to first response in milliseconds
  resolutionTime?: number; // Time to resolution in milliseconds
  messageCount: number;
  lastMessageAt?: Timestamp;
  lastMessageBy?: string;
  internalNotes?: string; // Admin-only notes
}

// Message types
export interface Message {
  id: string;
  ticketId: string;
  userId: string;
  userEmail: string;
  userName: string;
  text: string;
  isInternal: boolean; // Admin-only messages not visible to users
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  editedAt?: Timestamp;
  attachments?: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  aiSuggestion?: {
    text: string;
    confidence: number;
    usedSuggestion: boolean;
  };
}

// Analytics types
export interface TicketAnalytics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  satisfactionScore?: number;
  ticketsByPriority: Record<TicketPriority, number>;
  ticketsByCategory: Record<TicketCategory, number>;
  ticketsByAgent: Record<string, number>;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  assignedTickets: number;
  resolvedTickets: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  satisfactionScore?: number;
  activeTickets: number;
}

// Real-time monitoring types
export interface SystemActivity {
  id: string;
  type: 'ticket_created' | 'ticket_updated' | 'message_added' | 'user_registered' | 'admin_action';
  description: string;
  userId: string;
  userName: string;
  ticketId?: string;
  timestamp: Timestamp;
  metadata?: Record<string, any>;
}

// Bulk operation types
export interface BulkUpdatePayload {
  ticketIds: string[];
  updates: Partial<Pick<Ticket, 'status' | 'priority' | 'category' | 'assignedTo' | 'assignedToName' | 'tags'>>;
}

export interface BulkOperationResult {
  success: string[];
  failed: string[];
  errors: { ticketId: string; error: string }[];
}

// Filter types for admin queries
export interface AdminTicketFilters {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  category?: TicketCategory[];
  assignedTo?: string[];
  userId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  searchQuery?: string;
  tags?: string[];
  hasResponse?: boolean;
  isOverdue?: boolean;
}

// Admin-specific operations response types
export interface TicketAssignmentResult {
  ticketId: string;
  assignedTo: string;
  assignedToName: string;
  success: boolean;
  error?: string;
}

// System metrics for dashboard
export interface SystemMetrics {
  activeUsers: number;
  activeAgents: number;
  ticketsToday: number;
  ticketsThisWeek: number;
  ticketsThisMonth: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  aiProcessingQueue: number;
  errorRate: number;
  uptime: number;
}

// Shared TypeScript types for the SupportFlow AI application

export interface User {
  userId: string;
  email: string;
  role: 'user' | 'agent' | 'admin';
  createdAt: Date;
  lastLogin: Date;
}

export interface Ticket {
  ticketId: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  category: string;
  tags: string[];
  userId: string;
  assignedAgentId?: string;
  createdAt: Date;
  updatedAt: Date;
  aiMetadata: {
    processingStatus: 'pending' | 'completed' | 'failed';
    suggestedReplies: string[];
  };
}

export interface Message {
  messageId: string;
  ticketId: string;
  userId: string;
  text: string;
  isAiSuggestion: boolean;
  isUsedSuggestion: boolean;
  createdAt: Date;
}

export type TicketStatus = 'open' | 'in-progress' | 'resolved';
export type UserRole = 'user' | 'agent' | 'admin';
export type AIProcessingStatus = 'pending' | 'completed' | 'failed';

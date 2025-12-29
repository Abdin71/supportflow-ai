// Dashboard Statistics Service - Real-time metrics from Firestore

import { 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  Unsubscribe,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import type { Ticket } from './types';

export interface DashboardStats {
  openTickets: number;
  assignedToMe: number;
  totalTickets: number;
  resolvedTickets: number;
  avgResponseTime: string;
  resolutionRate: string;
}

/**
 * Calculate dashboard statistics
 */
export async function getDashboardStats(userId?: string): Promise<DashboardStats> {
  try {
    const ticketsRef = collection(db, 'tickets');
    const snapshot = await getDocs(ticketsRef);
    
    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Ticket));
    
    // Calculate metrics
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const assignedToMe = userId ? tickets.filter(t => t.assignedTo === userId).length : 0;
    const totalTickets = tickets.length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    
    // Calculate average response time (simplified)
    const avgResponseTime = calculateAvgResponseTime(tickets);
    
    // Calculate resolution rate
    const resolutionRate = totalTickets > 0 
      ? Math.round((resolvedTickets / totalTickets) * 100) 
      : 0;
    
    return {
      openTickets,
      assignedToMe,
      totalTickets,
      resolvedTickets,
      avgResponseTime,
      resolutionRate: `${resolutionRate}%`
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      openTickets: 0,
      assignedToMe: 0,
      totalTickets: 0,
      resolvedTickets: 0,
      avgResponseTime: '0m',
      resolutionRate: '0%'
    };
  }
}

/**
 * Subscribe to dashboard statistics with real-time updates
 */
export function subscribeToDashboardStats(
  callback: (stats: DashboardStats) => void,
  userId?: string
): Unsubscribe {
  const ticketsRef = collection(db, 'tickets');
  
  return onSnapshot(ticketsRef, (snapshot) => {
    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Ticket));
    
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const assignedToMe = userId ? tickets.filter(t => t.assignedTo === userId).length : 0;
    const totalTickets = tickets.length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    const avgResponseTime = calculateAvgResponseTime(tickets);
    const resolutionRate = totalTickets > 0 
      ? Math.round((resolvedTickets / totalTickets) * 100) 
      : 0;
    
    callback({
      openTickets,
      assignedToMe,
      totalTickets,
      resolvedTickets,
      avgResponseTime,
      resolutionRate: `${resolutionRate}%`
    });
  }, (error) => {
    console.error('Error subscribing to dashboard stats:', error);
  });
}

/**
 * Get recent activity (last 5 tickets updated)
 */
export async function getRecentActivity(limit: number = 5): Promise<Ticket[]> {
  try {
    const ticketsRef = collection(db, 'tickets');
    const snapshot = await getDocs(ticketsRef);
    
    const tickets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Ticket));
    
    // Sort by updatedAt and take the most recent
    return tickets
      .sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(0);
        const bTime = b.updatedAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
}

/**
 * Calculate average response time from tickets
 */
function calculateAvgResponseTime(tickets: Ticket[]): string {
  if (tickets.length === 0) return '0m';
  
  const totalMinutes = tickets.reduce((sum, ticket) => {
    const created = ticket.createdAt?.toDate?.() || new Date();
    const updated = ticket.updatedAt?.toDate?.() || new Date();
    const diffMs = updated.getTime() - created.getTime();
    return sum + Math.floor(diffMs / (1000 * 60)); // Convert to minutes
  }, 0);
  
  const avgMinutes = Math.floor(totalMinutes / tickets.length);
  
  if (avgMinutes < 60) {
    return `${avgMinutes}m`;
  } else if (avgMinutes < 1440) {
    return `${Math.floor(avgMinutes / 60)}h`;
  } else {
    return `${Math.floor(avgMinutes / 1440)}d`;
  }
}

/**
 * Get status and priority distribution for Quick Stats
 */
export async function getStatusDistribution(): Promise<{
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}> {
  try {
    const ticketsRef = collection(db, 'tickets');
    const snapshot = await getDocs(ticketsRef);
    
    const byStatus: Record<string, number> = {
      open: 0,
      'in-progress': 0,
      pending: 0,
      resolved: 0,
      closed: 0
    };
    
    const byPriority: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };
    
    snapshot.docs.forEach(doc => {
      const ticket = doc.data() as Ticket;
      
      // Count by status
      if (ticket.status in byStatus) {
        byStatus[ticket.status]++;
      }
      
      // Count by priority
      if (ticket.priority && ticket.priority in byPriority) {
        byPriority[ticket.priority]++;
      }
    });
    
    return { byStatus, byPriority };
  } catch (error) {
    console.error('Error getting status distribution:', error);
    return {
      byStatus: { open: 0, 'in-progress': 0, pending: 0, resolved: 0, closed: 0 },
      byPriority: { low: 0, medium: 0, high: 0, urgent: 0 }
    };
  }
}

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  Timestamp,
  Unsubscribe,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from './config';
import type {
  TicketAnalytics,
  AgentPerformance,
  SystemMetrics,
  SystemActivity,
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from './types';

/**
 * REAL-TIME MONITORING AND ANALYTICS FOR ADMIN DASHBOARD
 */

// Get real-time ticket analytics
export async function getTicketAnalytics(dateRange?: {
  from: Date;
  to: Date;
}): Promise<TicketAnalytics> {
  let q = query(collection(db, 'tickets'));

  if (dateRange) {
    q = query(
      q,
      where('createdAt', '>=', Timestamp.fromDate(dateRange.from)),
      where('createdAt', '<=', Timestamp.fromDate(dateRange.to))
    );
  }

  const snapshot = await getDocs(q);
  const tickets = snapshot.docs.map((doc) => doc.data()) as Ticket[];

  // Calculate metrics
  const analytics: TicketAnalytics = {
    totalTickets: tickets.length,
    openTickets: tickets.filter((t) => t.status === 'open').length,
    inProgressTickets: tickets.filter((t) => t.status === 'in-progress').length,
    resolvedTickets: tickets.filter((t) => t.status === 'resolved').length,
    closedTickets: tickets.filter((t) => t.status === 'closed').length,
    averageResponseTime: 0,
    averageResolutionTime: 0,
    ticketsByPriority: {
      low: tickets.filter((t) => t.priority === 'low').length,
      medium: tickets.filter((t) => t.priority === 'medium').length,
      high: tickets.filter((t) => t.priority === 'high').length,
      urgent: tickets.filter((t) => t.priority === 'urgent').length,
    },
    ticketsByCategory: {
      technical: tickets.filter((t) => t.category === 'technical').length,
      billing: tickets.filter((t) => t.category === 'billing').length,
      general: tickets.filter((t) => t.category === 'general').length,
      'feature-request': tickets.filter((t) => t.category === 'feature-request').length,
      bug: tickets.filter((t) => t.category === 'bug').length,
    },
    ticketsByAgent: {},
  };

  // Calculate average response time
  const ticketsWithResponse = tickets.filter((t) => t.responseTime);
  if (ticketsWithResponse.length > 0) {
    analytics.averageResponseTime =
      ticketsWithResponse.reduce((sum, t) => sum + (t.responseTime || 0), 0) /
      ticketsWithResponse.length;
  }

  // Calculate average resolution time
  const resolvedTickets = tickets.filter((t) => t.resolutionTime);
  if (resolvedTickets.length > 0) {
    analytics.averageResolutionTime =
      resolvedTickets.reduce((sum, t) => sum + (t.resolutionTime || 0), 0) /
      resolvedTickets.length;
  }

  // Calculate tickets by agent
  tickets.forEach((ticket) => {
    if (ticket.assignedTo) {
      analytics.ticketsByAgent[ticket.assignedTo] =
        (analytics.ticketsByAgent[ticket.assignedTo] || 0) + 1;
    }
  });

  return analytics;
}

// Subscribe to real-time analytics updates
export function subscribeToTicketAnalytics(
  callback: (analytics: TicketAnalytics) => void,
  dateRange?: { from: Date; to: Date }
): Unsubscribe {
  let q = query(collection(db, 'tickets'));

  if (dateRange) {
    q = query(
      q,
      where('createdAt', '>=', Timestamp.fromDate(dateRange.from)),
      where('createdAt', '<=', Timestamp.fromDate(dateRange.to))
    );
  }

  return onSnapshot(q, async (snapshot) => {
    const analytics = await getTicketAnalytics(dateRange);
    callback(analytics);
  });
}

// Get agent performance metrics
export async function getAgentPerformance(
  agentId: string,
  dateRange?: { from: Date; to: Date }
): Promise<AgentPerformance> {
  let q = query(
    collection(db, 'tickets'),
    where('assignedTo', '==', agentId)
  );

  if (dateRange) {
    q = query(
      q,
      where('createdAt', '>=', Timestamp.fromDate(dateRange.from)),
      where('createdAt', '<=', Timestamp.fromDate(dateRange.to))
    );
  }

  const snapshot = await getDocs(q);
  const tickets = snapshot.docs.map((doc) => doc.data()) as Ticket[];

  const resolvedTickets = tickets.filter((t) => t.status === 'resolved');
  const activeTickets = tickets.filter((t) =>
    ['open', 'in-progress'].includes(t.status)
  );

  // Calculate averages
  const ticketsWithResponse = tickets.filter((t) => t.responseTime);
  const averageResponseTime =
    ticketsWithResponse.length > 0
      ? ticketsWithResponse.reduce((sum, t) => sum + (t.responseTime || 0), 0) /
        ticketsWithResponse.length
      : 0;

  const ticketsWithResolution = tickets.filter((t) => t.resolutionTime);
  const averageResolutionTime =
    ticketsWithResolution.length > 0
      ? ticketsWithResolution.reduce((sum, t) => sum + (t.resolutionTime || 0), 0) /
        ticketsWithResolution.length
      : 0;

  // Get agent name
  const agentDoc = await getDoc(doc(db, 'users', agentId));
  const agentName = agentDoc.exists()
    ? agentDoc.data().displayName || 'Unknown Agent'
    : 'Unknown Agent';

  return {
    agentId,
    agentName,
    assignedTickets: tickets.length,
    resolvedTickets: resolvedTickets.length,
    averageResponseTime,
    averageResolutionTime,
    activeTickets: activeTickets.length,
  };
}

// Get all agents' performance
export async function getAllAgentsPerformance(dateRange?: {
  from: Date;
  to: Date;
}): Promise<AgentPerformance[]> {
  // Get all tickets
  let q = query(collection(db, 'tickets'), where('assignedTo', '!=', null));

  if (dateRange) {
    q = query(
      q,
      where('createdAt', '>=', Timestamp.fromDate(dateRange.from)),
      where('createdAt', '<=', Timestamp.fromDate(dateRange.to))
    );
  }

  const snapshot = await getDocs(q);
  const tickets = snapshot.docs.map((doc) => doc.data()) as Ticket[];

  // Group by agent
  const agentTickets: Record<string, Ticket[]> = {};
  tickets.forEach((ticket) => {
    if (ticket.assignedTo) {
      if (!agentTickets[ticket.assignedTo]) {
        agentTickets[ticket.assignedTo] = [];
      }
      agentTickets[ticket.assignedTo].push(ticket);
    }
  });

  // Calculate performance for each agent
  const performances: AgentPerformance[] = [];
  for (const [agentId, agentTicketsData] of Object.entries(agentTickets)) {
    const performance = await getAgentPerformance(agentId, dateRange);
    performances.push(performance);
  }

  return performances.sort((a, b) => b.resolvedTickets - a.resolvedTickets);
}

// Get system metrics for dashboard
export async function getSystemMetrics(): Promise<SystemMetrics> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  // Get user counts
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const users = usersSnapshot.docs.map((doc) => doc.data());
  const activeUsers = users.filter((u: any) => u.isActive).length;
  const activeAgents = users.filter(
    (u: any) => ['admin', 'manager', 'agent'].includes(u.role) && u.isActive
  ).length;

  // Get ticket counts by time period
  const ticketsToday = await getDocs(
    query(
      collection(db, 'tickets'),
      where('createdAt', '>=', Timestamp.fromDate(today))
    )
  );

  const ticketsThisWeek = await getDocs(
    query(
      collection(db, 'tickets'),
      where('createdAt', '>=', Timestamp.fromDate(weekAgo))
    )
  );

  const ticketsThisMonth = await getDocs(
    query(
      collection(db, 'tickets'),
      where('createdAt', '>=', Timestamp.fromDate(monthAgo))
    )
  );

  // Get all tickets for averages
  const allTicketsSnapshot = await getDocs(collection(db, 'tickets'));
  const allTickets = allTicketsSnapshot.docs.map((doc) => doc.data()) as Ticket[];

  const ticketsWithResponse = allTickets.filter((t) => t.responseTime);
  const averageResponseTime =
    ticketsWithResponse.length > 0
      ? ticketsWithResponse.reduce((sum, t) => sum + (t.responseTime || 0), 0) /
        ticketsWithResponse.length
      : 0;

  const ticketsWithResolution = allTickets.filter((t) => t.resolutionTime);
  const averageResolutionTime =
    ticketsWithResolution.length > 0
      ? ticketsWithResolution.reduce((sum, t) => sum + (t.resolutionTime || 0), 0) /
        ticketsWithResolution.length
      : 0;

  // Get AI processing queue count (tickets with pending AI analysis)
  const aiProcessingQueue = allTickets.filter(
    (t) => t.aiMetadata.processingStatus === 'pending'
  ).length;

  return {
    activeUsers,
    activeAgents,
    ticketsToday: ticketsToday.size,
    ticketsThisWeek: ticketsThisWeek.size,
    ticketsThisMonth: ticketsThisMonth.size,
    averageResponseTime,
    averageResolutionTime,
    aiProcessingQueue,
    errorRate: 0, // Would need to track errors separately
    uptime: 99.9, // Would need monitoring service
  };
}

// Subscribe to real-time system metrics
export function subscribeToSystemMetrics(
  callback: (metrics: SystemMetrics) => void
): Unsubscribe {
  // Subscribe to tickets collection for live updates
  const unsubscribe = onSnapshot(collection(db, 'tickets'), async () => {
    const metrics = await getSystemMetrics();
    callback(metrics);
  });

  return unsubscribe;
}

// Get recent system activity
export async function getRecentActivity(limitCount: number = 50): Promise<SystemActivity[]> {
  // Note: You'd need to create an 'activity' collection that logs all actions
  // For now, we'll derive activity from recent tickets and messages
  
  const ticketsQuery = query(
    collection(db, 'tickets'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(ticketsQuery);
  const activities: SystemActivity[] = [];

  snapshot.docs.forEach((doc) => {
    const ticket = doc.data() as Ticket;
    activities.push({
      id: doc.id,
      type: 'ticket_created',
      description: `New ticket: ${ticket.subject}`,
      userId: ticket.userId,
      userName: ticket.userName,
      ticketId: doc.id,
      timestamp: ticket.createdAt,
      metadata: {
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
      },
    });
  });

  return activities.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
}

// Subscribe to real-time activity feed
export function subscribeToRecentActivity(
  callback: (activities: SystemActivity[]) => void,
  limitCount: number = 50
): Unsubscribe {
  const q = query(
    collection(db, 'tickets'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, async () => {
    const activities = await getRecentActivity(limitCount);
    callback(activities);
  });
}

// Get tickets trend data (for charts)
export async function getTicketsTrend(days: number = 30): Promise<{
  dates: string[];
  open: number[];
  resolved: number[];
  total: number[];
}> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const q = query(
    collection(db, 'tickets'),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate))
  );

  const snapshot = await getDocs(q);
  const tickets = snapshot.docs.map((doc) => doc.data()) as Ticket[];

  // Group by date
  const dataByDate: Record<
    string,
    { open: number; resolved: number; total: number }
  > = {};

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    dataByDate[dateStr] = { open: 0, resolved: 0, total: 0 };
  }

  tickets.forEach((ticket) => {
    const dateStr = ticket.createdAt.toDate().toISOString().split('T')[0];
    if (dataByDate[dateStr]) {
      dataByDate[dateStr].total++;
      if (ticket.status === 'open') {
        dataByDate[dateStr].open++;
      } else if (ticket.status === 'resolved') {
        dataByDate[dateStr].resolved++;
      }
    }
  });

  const dates = Object.keys(dataByDate).sort();
  const open = dates.map((date) => dataByDate[date].open);
  const resolved = dates.map((date) => dataByDate[date].resolved);
  const total = dates.map((date) => dataByDate[date].total);

  return { dates, open, resolved, total };
}

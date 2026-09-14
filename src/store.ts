import { createContext, useContext } from 'react';
import { AppState, User, Event, Attendance, Registration, Payment, ActivityLog, EmailMessage, OrgSettings, Toast } from './types';
import { v4 as uuidv4 } from 'uuid';
import { mailer } from './mailer';

const DEFAULT_MEDALS = [
  { id: '1', name: 'Bronze', icon: '🥉', hoursRequired: 10, color: '#cd7f32' },
  { id: '2', name: 'Silver', icon: '🥈', hoursRequired: 25, color: '#c0c0c0' },
  { id: '3', name: 'Gold', icon: '🥇', hoursRequired: 50, color: '#ffd700' },
  { id: '4', name: 'Platinum', icon: '💎', hoursRequired: 100, color: '#e5e4e2' },
  { id: '5', name: 'Diamond', icon: '⭐', hoursRequired: 250, color: '#b9f2ff' },
];

const DEFAULT_SETTINGS: OrgSettings = {
  orgName: 'Community Volunteers Hub',
  tagline: 'Building stronger communities together',
  mission: 'We empower communities through dedicated volunteer service, connecting passionate individuals with meaningful opportunities to make a difference. Our mission is to foster compassion, build capacity, and create lasting positive impact in every neighborhood we serve.',
  logo: '🌿',
  themeColor: '#1a5c3a',
  contactEmail: 'info@communityvolunteers.org',
  contactPhone: '(555) 123-4567',
  address: '123 Community Lane, Springfield, IL 62701',
  ein: '12-3456789',
  paymentsEnabled: true,
  dollarPerHour: 29,
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: 'noreply@communityvolunteers.org',
  payoutLabel: 'Community Volunteers Hub',
  waiverText: 'I hereby waive and release the organization from any and all liability, claims, or demands arising from my participation in volunteer activities. I understand the risks involved and agree to participate at my own risk. I certify that I am physically fit to participate and have not been advised otherwise by a medical professional.',
  medals: DEFAULT_MEDALS,
};

function generateSampleData(): Partial<AppState> {
  const adminUser: User = {
    id: uuidv4(),
    email: 'admin@communityvolunteers.org',
    password: 'admin123',
    name: 'Sarah Johnson',
    phone: '(555) 100-0001',
    title: 'Executive Director',
    role: 'admin',
    groups: ['Leadership', 'Mentors'],
    status: 'active',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    totalHours: 87,
    waiverSigned: true,
    waiverSignedAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  };

  const members: User[] = [
    { id: uuidv4(), email: 'mike@example.com', password: 'member123', name: 'Mike Chen', phone: '(555) 200-0001', title: 'Trail Lead', role: 'member', groups: ['Trail Leads'], status: 'active', createdAt: new Date(Date.now() - 60 * 86400000).toISOString(), totalHours: 52, waiverSigned: true, waiverSignedAt: new Date(Date.now() - 60 * 86400000).toISOString() },
    { id: uuidv4(), email: 'emma@example.com', password: 'member123', name: 'Emma Rodriguez', phone: '(555) 200-0002', title: 'Mentor', role: 'member', groups: ['Mentors'], status: 'active', createdAt: new Date(Date.now() - 45 * 86400000).toISOString(), totalHours: 34, waiverSigned: true, waiverSignedAt: new Date(Date.now() - 45 * 86400000).toISOString() },
    { id: uuidv4(), email: 'james@example.com', password: 'member123', name: 'James Wilson', phone: '(555) 200-0003', title: 'Volunteer', role: 'member', groups: ['General'], status: 'active', createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), totalHours: 18, waiverSigned: true, waiverSignedAt: new Date(Date.now() - 30 * 86400000).toISOString() },
    { id: uuidv4(), email: 'lisa@example.com', password: 'member123', name: 'Lisa Park', phone: '(555) 200-0004', title: 'Event Coordinator', role: 'member', groups: ['Leadership', 'General'], status: 'active', createdAt: new Date(Date.now() - 20 * 86400000).toISOString(), totalHours: 12, waiverSigned: true, waiverSignedAt: new Date(Date.now() - 20 * 86400000).toISOString() },
    { id: uuidv4(), email: 'tom@example.com', password: 'member123', name: 'Tom Baker', phone: '(555) 200-0005', title: 'Volunteer', role: 'member', groups: ['General'], status: 'active', createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), totalHours: 5, waiverSigned: false },
  ];

  const allUsers = [adminUser, ...members];
  const now = new Date();

  const events: Event[] = [
    { id: uuidv4(), title: 'Community Garden Cleanup', description: 'Join us for a morning of beautifying our community garden. Tools and refreshments provided.', location: 'Riverside Community Garden', startDate: new Date(now.getTime() + 2 * 86400000).toISOString(), endDate: new Date(now.getTime() + 2 * 86400000 + 4 * 3600000).toISOString(), capacity: 20, fee: 0, isPublic: true, invitedGroups: [], isRecurring: true, recurrenceType: 'weekly', requireWaiver: false, status: 'upcoming', createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
    { id: uuidv4(), title: 'Youth Mentoring Workshop', description: 'Training session for new mentors. Learn techniques for effective youth engagement.', location: 'Community Center Room 204', startDate: new Date(now.getTime() + 5 * 86400000).toISOString(), endDate: new Date(now.getTime() + 5 * 86400000 + 3 * 3600000).toISOString(), capacity: 15, fee: 0, isPublic: false, invitedGroups: ['Mentors'], isRecurring: false, requireWaiver: true, status: 'upcoming', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: uuidv4(), title: 'Trail Maintenance Day', description: 'Help maintain and improve our local hiking trails. Bring work gloves and water.', location: 'Pine Ridge Trailhead', startDate: new Date(now.getTime() + 7 * 86400000).toISOString(), endDate: new Date(now.getTime() + 7 * 86400000 + 6 * 3600000).toISOString(), capacity: 30, fee: 0, isPublic: true, invitedGroups: [], isRecurring: true, recurrenceType: 'monthly', requireWaiver: true, status: 'upcoming', createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
    { id: uuidv4(), title: 'First Aid Certification', description: 'Get certified in basic first aid and CPR. Materials fee applies.', location: 'Fire Station #3 Training Room', startDate: new Date(now.getTime() + 10 * 86400000).toISOString(), endDate: new Date(now.getTime() + 10 * 86400000 + 8 * 3600000).toISOString(), capacity: 12, fee: 25, isPublic: true, invitedGroups: [], isRecurring: false, requireWaiver: true, status: 'upcoming', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: uuidv4(), title: 'Food Bank Sorting', description: 'Sort and package donations for distribution to families in need.', location: 'Springfield Food Bank', startDate: new Date(now.getTime() - 1 * 3600000).toISOString(), endDate: new Date(now.getTime() + 3 * 3600000).toISOString(), capacity: 25, fee: 0, isPublic: true, invitedGroups: [], isRecurring: true, recurrenceType: 'weekly', requireWaiver: false, status: 'live', createdAt: new Date(Date.now() - 21 * 86400000).toISOString() },
    { id: uuidv4(), title: 'Park Cleanup (Last Week)', description: 'Monthly park beautification event.', location: 'Central Park', startDate: new Date(Date.now() - 7 * 86400000).toISOString(), endDate: new Date(Date.now() - 7 * 86400000 + 4 * 3600000).toISOString(), capacity: 20, fee: 0, isPublic: true, invitedGroups: [], isRecurring: false, requireWaiver: false, status: 'past', createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  ];

  const registrations: Registration[] = [
    { id: uuidv4(), userId: members[0].id, eventId: events[4].id, registeredAt: new Date(Date.now() - 2 * 86400000).toISOString(), paid: false, refunded: false },
    { id: uuidv4(), userId: members[1].id, eventId: events[4].id, registeredAt: new Date(Date.now() - 1 * 86400000).toISOString(), paid: false, refunded: false },
    { id: uuidv4(), userId: members[2].id, eventId: events[4].id, registeredAt: new Date(Date.now() - 1 * 86400000).toISOString(), paid: false, refunded: false },
    { id: uuidv4(), userId: members[0].id, eventId: events[0].id, registeredAt: new Date(Date.now() - 1 * 86400000).toISOString(), paid: false, refunded: false },
    { id: uuidv4(), userId: members[3].id, eventId: events[3].id, registeredAt: new Date(Date.now() - 3 * 86400000).toISOString(), paid: true, receiptId: 'RCP-' + Math.random().toString(36).substr(2, 8).toUpperCase(), refunded: false },
  ];

  const attendance: Attendance[] = [
    { id: uuidv4(), userId: members[0].id, eventId: events[4].id, checkIn: new Date(now.getTime() - 45 * 60000).toISOString(), checkOut: null, isWalkIn: false, hours: 0.75, status: 'checked-in' },
    { id: uuidv4(), userId: members[1].id, eventId: events[4].id, checkIn: new Date(now.getTime() - 30 * 60000).toISOString(), checkOut: null, isWalkIn: false, hours: 0.5, status: 'checked-in' },
    { id: uuidv4(), userId: members[2].id, eventId: events[4].id, checkIn: new Date(now.getTime() - 60 * 60000).toISOString(), checkOut: new Date(now.getTime() - 15 * 60000).toISOString(), isWalkIn: true, hours: 0.75, status: 'completed' },
    { id: uuidv4(), userId: members[0].id, eventId: events[5].id, checkIn: new Date(Date.now() - 7 * 86400000).toISOString(), checkOut: new Date(Date.now() - 7 * 86400000 + 3.5 * 3600000).toISOString(), isWalkIn: false, hours: 3.5, status: 'completed' },
    { id: uuidv4(), userId: members[1].id, eventId: events[5].id, checkIn: new Date(Date.now() - 7 * 86400000).toISOString(), checkOut: new Date(Date.now() - 7 * 86400000 + 4 * 3600000).toISOString(), isWalkIn: false, hours: 4, status: 'completed' },
  ];

  const payments: Payment[] = [
    { id: uuidv4(), userId: members[3].id, eventId: events[3].id, amount: 25, method: 'card', status: 'paid', receiptId: 'RCP-' + Math.random().toString(36).substr(2, 8).toUpperCase(), createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  ];

  const activityLog: ActivityLog[] = [
    { id: uuidv4(), type: 'check-in', userId: members[0].id, eventId: events[4].id, message: 'Mike Chen checked in to Food Bank Sorting', timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
    { id: uuidv4(), type: 'check-in', userId: members[1].id, eventId: events[4].id, message: 'Emma Rodriguez checked in to Food Bank Sorting', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
    { id: uuidv4(), type: 'registration', userId: members[0].id, eventId: events[0].id, message: 'Mike Chen registered for Community Garden Cleanup', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: uuidv4(), type: 'medal', userId: members[0].id, message: 'Mike Chen earned the Silver medal! 🥈', timestamp: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: uuidv4(), type: 'payment', userId: members[3].id, message: 'Lisa Park paid $25 for First Aid Certification', timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: uuidv4(), type: 'event-created', eventId: events[3].id, message: 'New event created: First Aid Certification', timestamp: new Date(Date.now() - 5 * 86400000).toISOString() },
  ];

  return { users: allUsers, events, attendance, registrations, payments, activityLog, emails: [], settings: DEFAULT_SETTINGS };
}

export function loadState(): AppState {
  try {
    const saved = localStorage.getItem('volunteerhub_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, toasts: [], currentUser: parsed.currentUser || null };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  const sample = generateSampleData();
  return {
    users: sample.users || [],
    events: sample.events || [],
    attendance: sample.attendance || [],
    registrations: sample.registrations || [],
    payments: sample.payments || [],
    activityLog: sample.activityLog || [],
    emails: sample.emails || [],
    settings: sample.settings || DEFAULT_SETTINGS,
    currentUser: null,
    toasts: [],
  };
}

export function saveState(state: AppState) {
  try {
    const toSave = { ...state, toasts: [] };
    localStorage.setItem('volunteerhub_state', JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function resetState(): AppState {
  localStorage.removeItem('volunteerhub_state');
  const sample = generateSampleData();
  return {
    users: sample.users || [],
    events: sample.events || [],
    attendance: sample.attendance || [],
    registrations: sample.registrations || [],
    payments: sample.payments || [],
    activityLog: sample.activityLog || [],
    emails: sample.emails || [],
    settings: sample.settings || DEFAULT_SETTINGS,
    currentUser: null,
    toasts: [],
  };
}

// Helper functions
export function addActivity(state: AppState, activity: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog {
  return { ...activity, id: uuidv4(), timestamp: new Date().toISOString() };
}

export function addEmail(state: AppState, to: string, subject: string, html?: string, text?: string): EmailMessage {
  // Configure mailer with current settings
  mailer.configure({
    host: state.settings.smtpHost,
    port: state.settings.smtpPort,
    user: state.settings.smtpUser,
    pass: state.settings.smtpPass,
    from: state.settings.smtpFrom,
    fromName: state.settings.orgName,
    secure: state.settings.smtpPort === 465,
  });

  // Queue the email for delivery
  if (html && text) {
    mailer.queueEmail(to, subject, html, text);
  } else {
    // Simple fallback
    mailer.queueEmail(to, subject, `<p>${subject}</p>`, subject);
  }

  return { id: uuidv4(), to, subject, status: 'queued', createdAt: new Date().toISOString() };
}

export function addToast(state: AppState, message: string, type: Toast['type'] = 'info'): Toast {
  return { id: uuidv4(), message, type };
}

export function calculateHours(checkIn: string | null, checkOut: string | null): number {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round((diff / 3600000) * 100) / 100;
}

export function getEventStatus(event: Event): 'upcoming' | 'live' | 'past' {
  const now = new Date().getTime();
  const start = new Date(event.startDate).getTime();
  const end = new Date(event.endDate).getTime();
  if (now >= start && now <= end) return 'live';
  if (now > end) return 'past';
  return 'upcoming';
}

export function getUserMedals(user: User, medals: typeof DEFAULT_MEDALS) {
  return medals.filter(m => user.totalHours >= m.hoursRequired);
}

export function getNextMedal(user: User, medals: typeof DEFAULT_MEDALS) {
  return medals.find(m => user.totalHours < m.hoursRequired);
}

export function getEventRegistrations(state: AppState, eventId: string) {
  return state.registrations.filter(r => r.eventId === eventId);
}

export function getEventAttendees(state: AppState, eventId: string) {
  return state.attendance.filter(a => a.eventId === eventId);
}

export function getRevenue(state: AppState) {
  return state.payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
}

export function getTotalHours(state: AppState) {
  return state.users.reduce((sum, u) => sum + u.totalHours, 0);
}

export interface StoreContextType {
  state: AppState;
  setState: (fn: (prev: AppState) => AppState) => void;
}

export const StoreContext = createContext<StoreContextType>({
  state: loadState(),
  setState: () => {},
});

export function useStore() {
  return useContext(StoreContext);
}

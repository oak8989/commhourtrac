export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  title: string;
  role: 'admin' | 'member';
  groups: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  totalHours: number;
  waiverSigned: boolean;
  waiverSignedAt?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  fee: number;
  isPublic: boolean;
  invitedGroups: string[];
  isRecurring: boolean;
  recurrenceType?: 'weekly' | 'monthly';
  recurrenceEnd?: string;
  requireWaiver: boolean;
  status: 'upcoming' | 'live' | 'past';
  createdAt: string;
}

export interface Attendance {
  id: string;
  userId: string;
  eventId: string;
  checkIn: string | null;
  checkOut: string | null;
  isWalkIn: boolean;
  hours: number;
  status: 'registered' | 'checked-in' | 'completed' | 'no-show';
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  registeredAt: string;
  paid: boolean;
  receiptId?: string;
  refunded: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  eventId: string;
  amount: number;
  method: 'card' | 'cash' | 'check';
  status: 'paid' | 'refunded' | 'pending';
  receiptId: string;
  createdAt: string;
}

export interface Medal {
  id: string;
  name: string;
  icon: string;
  hoursRequired: number;
  color: string;
}

export interface ActivityLog {
  id: string;
  type: 'check-in' | 'check-out' | 'registration' | 'medal' | 'payment' | 'refund' | 'email' | 'event-created' | 'member-added';
  userId?: string;
  eventId?: string;
  message: string;
  timestamp: string;
}

export interface EmailMessage {
  id: string;
  to: string;
  subject: string;
  status: 'queued' | 'delivered' | 'failed';
  createdAt: string;
}

export interface OrgSettings {
  orgName: string;
  tagline: string;
  mission: string;
  logo: string;
  themeColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  ein: string;
  paymentsEnabled: boolean;
  dollarPerHour: number;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  payoutLabel: string;
  waiverText: string;
  medals: Medal[];
}

export interface AppState {
  users: User[];
  events: Event[];
  attendance: Attendance[];
  registrations: Registration[];
  payments: Payment[];
  activityLog: ActivityLog[];
  emails: EmailMessage[];
  settings: OrgSettings;
  currentUser: User | null;
  toasts: Toast[];
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Calendar, Users, BarChart3, Settings, Rocket, LogOut, Search, Plus, Edit, Trash2, Download, Filter, Clock, MapPin, DollarSign, Mail, Shield, Check, X, Eye, UserPlus, ChevronDown, ChevronUp, RefreshCw, Send, QrCode, AlertTriangle, TrendingUp, Award, Activity, Zap } from 'lucide-react';
import { useStore, addToast, addActivity, addEmail, getEventStatus, getEventRegistrations, getEventAttendees, getRevenue, getTotalHours, calculateHours } from '../store';
import { Event, User, Attendance, Medal } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Modal, ConfirmDialog, Badge, CapacityBar, PulsingDot, CountUp, ProgressRing } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type AdminView = 'dashboard' | 'events' | 'members' | 'impact' | 'settings' | 'deploy';

export default function Admin({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { state, setState } = useStore();
  const [view, setView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentUser = state.currentUser;
  if (!currentUser || currentUser.role !== 'admin') {
    onNavigate('login');
    return null;
  }

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null, toasts: [...prev.toasts, addToast(prev, 'Signed out successfully', 'info')] }));
    onNavigate('landing');
  };

  const navItems = [
    { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'events' as const, icon: Calendar, label: 'Events' },
    { id: 'members' as const, icon: Users, label: 'Members' },
    { id: 'impact' as const, icon: BarChart3, label: 'Impact' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
    { id: 'deploy' as const, icon: Rocket, label: 'Deploy' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside initial={false} animate={{ width: sidebarOpen ? 260 : 72 }} className="bg-[#1a2e1a] text-white flex flex-col overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b border-white/10">
          <span className="text-2xl flex-shrink-0">{state.settings.logo}</span>
          {sidebarOpen && <span className="font-bold text-sm truncate">{state.settings.orgName}</span>}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${view === item.id ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <item.icon size={20} className="flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-white/60">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold flex-shrink-0">{currentUser.name.charAt(0)}</div>
            {sidebarOpen && <span className="truncate">{currentUser.name}</span>}
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5">
            <LogOut size={20} className="flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          {view === 'dashboard' && <DashboardView />}
          {view === 'events' && <EventsView />}
          {view === 'members' && <MembersView />}
          {view === 'impact' && <ImpactView />}
          {view === 'settings' && <SettingsView />}
          {view === 'deploy' && <DeployView />}
        </div>
      </main>
    </div>
  );
}

// Dashboard View
function DashboardView() {
  const { state } = useStore();
  const totalHours = getTotalHours(state);
  const revenue = getRevenue(state);
  const activeCheckins = state.attendance.filter(a => a.checkIn && !a.checkOut).length;
  const upcomingEvents = state.events.filter(e => getEventStatus(e) === 'upcoming').slice(0, 5);

  const stats = [
    { label: 'Total Hours', value: totalHours, icon: Clock, color: 'bg-blue-500' },
    { label: 'Active Volunteers', value: state.users.filter(u => u.status === 'active').length, icon: Users, color: 'bg-green-500' },
    { label: 'Revenue', value: revenue, icon: DollarSign, color: 'bg-purple-500', prefix: '$' },
    { label: 'Events', value: state.events.length, icon: Calendar, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1"><CountUp end={stat.value} prefix={stat.prefix || ''} /></p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon size={20} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Calendar size={18} /> Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500">{new Date(event.startDate).toLocaleDateString()} • {event.location}</p>
                </div>
                <Badge variant={getEventStatus(event) === 'live' ? 'success' : 'info'}>
                  {getEventRegistrations(state, event.id).length}/{event.capacity}
                </Badge>
              </div>
            ))}
            {upcomingEvents.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No upcoming events</p>}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Activity size={18} /> Recent Activity</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {state.activityLog.slice(0, 10).map(log => (
              <div key={log.id} className="flex items-start gap-3 p-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">{log.message}</p>
                  <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {state.activityLog.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No activity yet</p>}
          </div>
        </div>

        {/* Top Volunteers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Award size={18} /> Top Volunteers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.users.filter(u => u.status === 'active').sort((a, b) => b.totalHours - a.totalHours).slice(0, 6).map((user, i) => (
              <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg font-bold text-gray-300">#{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">{user.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.totalHours}h</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Events View
function EventsView() {
  const { state, setState } = useStore();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'past' | 'recurring'>('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingAttendance, setViewingAttendance] = useState<Event | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    let events = [...state.events];
    if (filter !== 'all') {
      if (filter === 'recurring') events = events.filter(e => e.isRecurring);
      else events = events.filter(e => getEventStatus(e) === filter);
    }
    if (search) events = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase()));
    return events.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [state.events, filter, search]);

  const handleDelete = (id: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id),
      registrations: prev.registrations.filter(r => r.eventId !== id),
      attendance: prev.attendance.filter(a => a.eventId !== id),
      payments: prev.payments.filter(p => p.eventId !== id),
      toasts: [...prev.toasts, addToast(prev, 'Event deleted', 'success')],
    }));
  };

  const exportCSV = (event: Event) => {
    const attendees = getEventAttendees(state, event.id);
    const regs = getEventRegistrations(state, event.id);
    let csv = 'Name,Email,Status,Check In,Check Out,Hours,Walk-In,Paid\n';
    attendees.forEach(a => {
      const user = state.users.find(u => u.id === a.userId);
      const reg = regs.find(r => r.userId === a.userId);
      if (user) csv += `"${user.name}","${user.email}",${a.status},${a.checkIn || ''},${a.checkOut || ''},${a.hours},${a.isWalkIn},${reg?.paid || false}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${event.title}-attendance.csv`; a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: state.settings.themeColor }}>
          <Plus size={16} /> New Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div className="flex gap-2">
          {(['all', 'upcoming', 'live', 'past', 'recurring'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.map(event => {
          const status = getEventStatus(event);
          const regs = getEventRegistrations(state, event.id);
          return (
            <motion.div key={event.id} layout className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    {status === 'live' && <PulsingDot />}
                    {event.isPublic ? <Badge variant="info">Public</Badge> : <Badge variant="warning">Private</Badge>}
                    {event.isRecurring && <Badge variant="success">{event.recurrenceType}</Badge>}
                    {event.fee > 0 && <Badge variant="default">${event.fee}/person</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={12} />{new Date(event.startDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} />{event.location}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => setViewingAttendance(event)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Attendance"><Users size={16} /></button>
                  <button onClick={() => setEditingEvent(event)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Edit"><Edit size={16} /></button>
                  <button onClick={() => setDeleteConfirm(event.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="mt-3 max-w-xs"><CapacityBar current={regs.length} max={event.capacity} /></div>
            </motion.div>
          );
        })}
        {filteredEvents.length === 0 && <div className="text-center py-12 text-gray-400">No events found</div>}
      </div>

      {/* Create/Edit Modal */}
      {(showCreate || editingEvent) && (
        <EventForm event={editingEvent} onClose={() => { setShowCreate(false); setEditingEvent(null); }} />
      )}

      {/* Attendance Modal */}
      {viewingAttendance && (
        <AttendanceLedger event={viewingAttendance} onClose={() => setViewingAttendance(null)} onExport={exportCSV} />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)} title="Delete Event" message="This will permanently delete the event and all associated registrations and attendance records." confirmText="Delete" danger />
    </div>
  );
}

// Event Form
function EventForm({ event, onClose }: { event: Event | null; onClose: () => void }) {
  const { state, setState } = useStore();
  const [form, setForm] = useState({
    title: event?.title || '', description: event?.description || '', location: event?.location || '',
    startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
    endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
    capacity: event?.capacity || 20, fee: event?.fee || 0, isPublic: event?.isPublic ?? true,
    isRecurring: event?.isRecurring || false, recurrenceType: event?.recurrenceType || 'weekly',
    requireWaiver: event?.requireWaiver || false, invitedGroups: event?.invitedGroups || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData: Event = {
      id: event?.id || uuidv4(), ...form,
      startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString(),
      status: 'upcoming', createdAt: event?.createdAt || new Date().toISOString(),
    };

    const activity = addActivity(state, { type: 'event-created', eventId: eventData.id, message: `${event ? 'Updated' : 'Created'} event: ${eventData.title}` });

    setState(prev => ({
      ...prev,
      events: event ? prev.events.map(e => e.id === event.id ? eventData : e) : [...prev.events, eventData],
      activityLog: [activity, ...prev.activityLog],
      toasts: [...prev.toasts, addToast(prev, `Event ${event ? 'updated' : 'created'}!`, 'success')],
    }));
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title={event ? 'Edit Event' : 'Create Event'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} min={1} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date/Time</label>
            <input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date/Time</label>
            <input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee per person ($)</label>
            <input type="number" value={form.fee} onChange={e => setForm({ ...form, fee: +e.target.value })} min={0} step={0.01} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
            <select value={form.isPublic ? 'public' : 'private'} onChange={e => setForm({ ...form, isPublic: e.target.value === 'public' })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="public">Public</option>
              <option value="private">Private (Invite Groups)</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 pt-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isRecurring} onChange={e => setForm({ ...form, isRecurring: e.target.checked })} className="rounded" /> Recurring</label>
          {form.isRecurring && (
            <select value={form.recurrenceType} onChange={e => setForm({ ...form, recurrenceType: e.target.value as 'weekly' | 'monthly' })} className="px-3 py-1 border border-gray-200 rounded-lg text-sm">
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          )}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.requireWaiver} onChange={e => setForm({ ...form, requireWaiver: e.target.checked })} className="rounded" /> Require Waiver</label>
        </div>
        {!form.isPublic && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invite Groups</label>
            <div className="flex flex-wrap gap-2">
              {['Leadership', 'Mentors', 'Trail Leads', 'General'].map(g => (
                <label key={g} className="flex items-center gap-1 text-sm px-2 py-1 bg-gray-100 rounded">
                  <input type="checkbox" checked={form.invitedGroups.includes(g)} onChange={e => setForm({ ...form, invitedGroups: e.target.checked ? [...form.invitedGroups, g] : form.invitedGroups.filter(x => x !== g) })} />
                  {g}
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
          <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: state.settings.themeColor }}>{event ? 'Update' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  );
}

// Attendance Ledger
function AttendanceLedger({ event, onClose, onExport }: { event: Event; onClose: () => void; onExport: (e: Event) => void }) {
  const { state, setState } = useStore();
  const attendees = getEventAttendees(state, event.id);
  const registrations = getEventRegistrations(state, event.id);
  const [sortField, setSortField] = useState<'name' | 'status' | 'hours'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = useMemo(() => {
    return [...attendees].sort((a, b) => {
      const userA = state.users.find(u => u.id === a.userId);
      const userB = state.users.find(u => u.id === b.userId);
      let cmp = 0;
      if (sortField === 'name') cmp = (userA?.name || '').localeCompare(userB?.name || '');
      else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortField === 'hours') cmp = a.hours - b.hours;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [attendees, state.users, sortField, sortDir]);

  const handleCheckIn = (userId: string) => {
    const existing = attendees.find(a => a.userId === userId);
    if (existing) {
      setState(prev => ({
        ...prev,
        attendance: prev.attendance.map(a => a.id === existing.id ? { ...a, checkIn: new Date().toISOString(), status: 'checked-in' as const } : a),
        toasts: [...prev.toasts, addToast(prev, 'Checked in', 'success')],
      }));
    } else {
      setState(prev => ({
        ...prev,
        attendance: [...prev.attendance, { id: uuidv4(), userId, eventId: event.id, checkIn: new Date().toISOString(), checkOut: null, isWalkIn: true, hours: 0, status: 'checked-in' }],
        toasts: [...prev.toasts, addToast(prev, 'Walk-in recorded', 'success')],
      }));
    }
  };

  const handleCheckOut = (attendanceId: string) => {
    const att = attendees.find(a => a.id === attendanceId);
    if (!att) return;
    const hours = calculateHours(att.checkIn, new Date().toISOString());
    setState(prev => ({
      ...prev,
      attendance: prev.attendance.map(a => a.id === attendanceId ? { ...a, checkOut: new Date().toISOString(), hours, status: 'completed' as const } : a),
      users: prev.users.map(u => u.id === att.userId ? { ...u, totalHours: u.totalHours + hours } : u),
      toasts: [...prev.toasts, addToast(prev, `Checked out (${hours}h)`, 'success')],
    }));
  };

  return (
    <Modal isOpen onClose={onClose} title={`Attendance: ${event.title}`} size="xl">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{attendees.length} attendees • {registrations.length} registered</p>
        <button onClick={() => onExport(event)} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
          <Download size={14} /> Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2 font-medium text-gray-500 cursor-pointer" onClick={() => { setSortField('name'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>Name {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th className="pb-2 font-medium text-gray-500 cursor-pointer" onClick={() => { setSortField('status'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>Status {sortField === 'status' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th className="pb-2 font-medium text-gray-500">Check In</th>
              <th className="pb-2 font-medium text-gray-500">Check Out</th>
              <th className="pb-2 font-medium text-gray-500 cursor-pointer" onClick={() => { setSortField('hours'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>Hours {sortField === 'hours' && (sortDir === 'asc' ? '↑' : '↓')}</th>
              <th className="pb-2 font-medium text-gray-500">Type</th>
              <th className="pb-2 font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(att => {
              const user = state.users.find(u => u.id === att.userId);
              return (
                <tr key={att.id} className="border-b border-gray-50">
                  <td className="py-2 font-medium">{user?.name || 'Unknown'}</td>
                  <td className="py-2"><Badge variant={att.status === 'completed' ? 'success' : att.status === 'checked-in' ? 'info' : 'warning'}>{att.status}</Badge></td>
                  <td className="py-2 text-gray-500">{att.checkIn ? new Date(att.checkIn).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—'}</td>
                  <td className="py-2 text-gray-500">{att.checkOut ? new Date(att.checkOut).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—'}</td>
                  <td className="py-2">{att.hours > 0 ? `${att.hours}h` : (att.checkIn && !att.checkOut ? <LiveTimer checkIn={att.checkIn} /> : '—')}</td>
                  <td className="py-2">{att.isWalkIn ? <Badge variant="warning">Walk-in</Badge> : <Badge>Registered</Badge>}</td>
                  <td className="py-2">
                    {att.checkIn && !att.checkOut ? (
                      <button onClick={() => handleCheckOut(att.id)} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Check Out</button>
                    ) : !att.checkIn ? (
                      <button onClick={() => handleCheckIn(att.userId)} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">Check In</button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && <p className="text-center py-8 text-gray-400">No attendance records yet</p>}
      </div>
    </Modal>
  );
}

function LiveTimer({ checkIn }: { checkIn: string }) {
  const [elapsed, setElapsed] = useState('');
  React.useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(checkIn).getTime();
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setElapsed(`${hrs}h ${mins}m`);
    };
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, [checkIn]);
  return <span className="text-green-600 font-mono text-xs">{elapsed}</span>;
}

// Members View
function MembersView() {
  const { state, setState } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let users = [...state.users];
    if (statusFilter !== 'all') users = users.filter(u => u.status === statusFilter);
    if (search) users = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    return users;
  }, [state.users, search, statusFilter]);

  const adminCount = state.users.filter(u => u.role === 'admin' && u.status === 'active').length;

  const handleDelete = (id: string) => {
    const user = state.users.find(u => u.id === id);
    if (user?.role === 'admin' && adminCount <= 1) {
      setState(prev => ({ ...prev, toasts: [...prev.toasts, addToast(prev, 'Cannot delete the last admin!', 'error')] }));
      return;
    }
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id),
      attendance: prev.attendance.filter(a => a.userId !== id),
      registrations: prev.registrations.filter(r => r.userId !== id),
      payments: prev.payments.filter(p => p.userId !== id),
      toasts: [...prev.toasts, addToast(prev, 'Member deleted (cascade)', 'success')],
    }));
  };

  const exportMembersCSV = () => {
    let csv = 'Name,Email,Phone,Title,Role,Groups,Status,Hours,Created\n';
    filtered.forEach(u => {
      csv += `"${u.name}","${u.email}","${u.phone}","${u.title}","${u.role}","${u.groups.join(';')}","${u.status}",${u.totalHours},"${u.createdAt}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'members.csv'; a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <div className="flex gap-2">
          <button onClick={exportMembersCSV} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: state.settings.themeColor }}>
            <UserPlus size={16} /> Add Member
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        {(['all', 'active', 'inactive'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-sm font-medium ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Member</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Groups</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Hours</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">{user.name.charAt(0)}</div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant={user.role === 'admin' ? 'info' : 'default'}>{user.role}</Badge></td>
                <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{user.groups.map(g => <span key={g} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{g}</span>)}</div></td>
                <td className="px-4 py-3 text-gray-600">{user.totalHours}h</td>
                <td className="px-4 py-3"><Badge variant={user.status === 'active' ? 'success' : 'warning'}>{user.status}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditingUser(user)} className="p-1.5 text-gray-400 hover:text-green-600 rounded"><Edit size={14} /></button>
                  <button onClick={() => setDeleteConfirm(user.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No members found</div>}
      </div>

      {editingUser && <MemberForm user={editingUser} onClose={() => setEditingUser(null)} />}
      {showAdd && <AddMemberForm onClose={() => setShowAdd(false)} />}
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)} title="Delete Member" message="This will permanently remove the member and cascade delete all their attendance, registrations, payments, and waivers." confirmText="Delete" danger />
    </div>
  );
}

function MemberForm({ user, onClose }: { user: User; onClose: () => void }) {
  const { state, setState } = useStore();
  const [form, setForm] = useState({ ...user });

  const handleSave = () => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === user.id ? form : u),
      toasts: [...prev.toasts, addToast(prev, 'Member updated', 'success')],
    }));
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title="Edit Member" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as 'admin' | 'member' })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="member">Member</option><option value="admin">Admin</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Groups</label>
          <div className="flex flex-wrap gap-2">
            {['Leadership', 'Mentors', 'Trail Leads', 'General'].map(g => (
              <label key={g} className="flex items-center gap-1 text-sm px-2 py-1 bg-gray-100 rounded">
                <input type="checkbox" checked={form.groups.includes(g)} onChange={e => setForm({ ...form, groups: e.target.checked ? [...form.groups, g] : form.groups.filter(x => x !== g) })} />{g}
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: state.settings.themeColor }}>Save</button>
        </div>
      </div>
    </Modal>
  );
}

function AddMemberForm({ onClose }: { onClose: () => void }) {
  const { state, setState } = useStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', title: 'Volunteer', role: 'member' as const, groups: ['General'] });
  const randomPassword = Math.random().toString(36).slice(-10);

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    const newUser: User = {
      id: uuidv4(), ...form, password: randomPassword,
      status: 'active', createdAt: new Date().toISOString(), totalHours: 0, waiverSigned: false,
    };
    const activity = addActivity(state, { type: 'member-added', userId: newUser.id, message: `Admin added ${form.name}` });
    const emailMsg = addEmail(state, form.email, 'Welcome to ' + state.settings.orgName);
    setState(prev => ({
      ...prev, users: [...prev.users, newUser], activityLog: [activity, ...prev.activityLog], emails: [...prev.emails, emailMsg],
      toasts: [...prev.toasts, addToast(prev, `Member added! Password: ${randomPassword}`, 'success')],
    }));
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title="Add Member" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          A random password will be generated and shown after creation.
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
          <button onClick={handleAdd} className="px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: state.settings.themeColor }}>Add Member</button>
        </div>
      </div>
    </Modal>
  );
}

// Impact View
function ImpactView() {
  const { state } = useStore();
  const totalHours = getTotalHours(state);
  const revenue = getRevenue(state);
  const activeUsers = state.users.filter(u => u.status === 'active');
  const avgHours = activeUsers.length > 0 ? Math.round(totalHours / activeUsers.length * 10) / 10 : 0;
  const totalRegistrations = state.registrations.length;
  const totalCheckedIn = state.attendance.filter(a => a.status === 'completed' || a.status === 'checked-in').length;
  const showUpRate = totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0;

  // Monthly data
  const monthlyData = useMemo(() => {
    const months: { month: string; hours: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short' });
      const hours = state.attendance.filter(a => {
        if (!a.checkOut) return false;
        const ad = new Date(a.checkOut);
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
      }).reduce((s, a) => s + a.hours, 0);
      months.push({ month: label, hours: Math.round(hours * 10) / 10 });
    }
    return months;
  }, [state.attendance]);

  // Per-event breakdown
  const eventBreakdown = useMemo(() => {
    return state.events.filter(e => getEventStatus(e) === 'past').map(event => {
      const hours = state.attendance.filter(a => a.eventId === event.id).reduce((s, a) => s + a.hours, 0);
      return { title: event.title, hours };
    }).sort((a, b) => b.hours - a.hours);
  }, [state.events, state.attendance]);

  // Medal distribution
  const medalDistribution = state.settings.medals.map(medal => ({
    ...medal, count: state.users.filter(u => u.totalHours >= medal.hoursRequired).length,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Impact & Insights</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Hours', value: totalHours, suffix: 'h' },
          { label: 'Community Value', value: totalHours * state.settings.dollarPerHour, prefix: '$' },
          { label: 'Events Held', value: state.events.filter(e => getEventStatus(e) === 'past').length },
          { label: 'Avg Hours/Volunteer', value: avgHours, suffix: 'h' },
          { label: 'Show-up Rate', value: showUpRate, suffix: '%' },
          { label: 'Fees Collected', value: revenue, prefix: '$' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1"><CountUp end={typeof stat.value === 'number' ? stat.value : 0} prefix={stat.prefix || ''} suffix={stat.suffix || ''} /></p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Hours Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="hours" fill={state.settings.themeColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Volunteer Leaderboard</h3>
          <div className="space-y-3">
            {state.users.filter(u => u.status === 'active').sort((a, b) => b.totalHours - a.totalHours).slice(0, 8).map((user, i) => {
              const maxHours = state.users.reduce((max, u) => Math.max(max, u.totalHours), 0);
              const medals = state.settings.medals.filter(m => user.totalHours >= m.hoursRequired);
              return (
                <div key={user.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 w-6">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.totalHours}h {medals.map(m => m.icon).join('')}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(user.totalHours / maxHours) * 100}%`, backgroundColor: state.settings.themeColor }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-Event Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Hours Per Event</h3>
          <div className="space-y-3">
            {eventBreakdown.slice(0, 8).map((item, i) => {
              const maxH = eventBreakdown[0]?.hours || 1;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate">{item.title}</span>
                    <span className="text-gray-500">{item.hours}h</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${(item.hours / maxH) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {eventBreakdown.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No completed events yet</p>}
          </div>
        </div>

        {/* Medal Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Medal Distribution</h3>
          <div className="space-y-4">
            {medalDistribution.map(medal => (
              <div key={medal.id} className="flex items-center gap-4">
                <span className="text-2xl">{medal.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{medal.name} ({medal.hoursRequired}h)</span>
                    <span className="text-gray-500">{medal.count} members</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(medal.count / Math.max(state.users.length, 1)) * 100}%`, backgroundColor: medal.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings View
function SettingsView() {
  const { state, setState } = useStore();
  const [tab, setTab] = useState<'branding' | 'waivers' | 'awards' | 'payments' | 'email' | 'org'>('branding');
  const [settings, setSettings] = useState({ ...state.settings });

  const handleSave = () => {
    setState(prev => ({ ...prev, settings, toasts: [...prev.toasts, addToast(prev, 'Settings saved!', 'success')] }));
  };

  const themeColors = ['#1a5c3a', '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#0891b2'];
  const presetLogos = ['🌿', '🤝', '🌍', '❤️', '🏠', '⭐'];

  const tabs = [
    { id: 'branding' as const, label: 'Branding' },
    { id: 'org' as const, label: 'Organization' },
    { id: 'waivers' as const, label: 'Waivers' },
    { id: 'awards' as const, label: 'Awards' },
    { id: 'payments' as const, label: 'Payments' },
    { id: 'email' as const, label: 'Email' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab === t.id ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>{t.label}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {tab === 'branding' && (
          <div className="space-y-6">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label><input value={settings.orgName} onChange={e => setSettings({ ...settings, orgName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label><input value={settings.tagline} onChange={e => setSettings({ ...settings, tagline: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Mission Statement</label><textarea value={settings.mission} onChange={e => setSettings({ ...settings, mission: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <div className="flex gap-3">
                {presetLogos.map(logo => (
                  <button key={logo} onClick={() => setSettings({ ...settings, logo })} className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl ${settings.logo === logo ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>{logo}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme Accent</label>
              <div className="flex gap-3">
                {themeColors.map(color => (
                  <button key={color} onClick={() => setSettings({ ...settings, themeColor: color })} className={`w-10 h-10 rounded-full border-2 ${settings.themeColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'org' && (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label><input value={settings.contactEmail} onChange={e => setSettings({ ...settings, contactEmail: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label><input value={settings.contactPhone} onChange={e => setSettings({ ...settings, contactPhone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">EIN (Tax ID)</label><input value={settings.ein} onChange={e => setSettings({ ...settings, ein: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Dollar Value per Hour</label><input type="number" value={settings.dollarPerHour} onChange={e => setSettings({ ...settings, dollarPerHour: +e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
        )}

        {tab === 'waivers' && (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Waiver Text</label><textarea value={settings.waiverText} onChange={e => setSettings({ ...settings, waiverText: e.target.value })} rows={6} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
        )}

        {tab === 'awards' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Configure medal thresholds (hours required to earn each medal)</p>
            {settings.medals.map((medal, i) => (
              <div key={medal.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">{medal.icon}</span>
                <input value={medal.name} onChange={e => { const m = [...settings.medals]; m[i] = { ...m[i], name: e.target.value }; setSettings({ ...settings, medals: m }); }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                <input type="number" value={medal.hoursRequired} onChange={e => { const m = [...settings.medals]; m[i] = { ...m[i], hoursRequired: +e.target.value }; setSettings({ ...settings, medals: m }); }} className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                <span className="text-sm text-gray-500">hours</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'payments' && (
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input type="checkbox" checked={settings.paymentsEnabled} onChange={e => setSettings({ ...settings, paymentsEnabled: e.target.checked })} className="rounded" />
              <div>
                <p className="font-medium text-sm text-gray-900">Enable Payments</p>
                <p className="text-xs text-gray-500">Allow events to have fees</p>
              </div>
            </label>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Payout Account Label</label><input value={settings.payoutLabel} onChange={e => setSettings({ ...settings, payoutLabel: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
        )}

        {tab === 'email' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-700">SMTP Relay Status: Online</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600"><RefreshCw size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label><input value={settings.smtpHost} onChange={e => setSettings({ ...settings, smtpHost: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label><input type="number" value={settings.smtpPort} onChange={e => setSettings({ ...settings, smtpPort: +e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">SMTP User</label><input value={settings.smtpUser} onChange={e => setSettings({ ...settings, smtpUser: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label><input type="password" value={settings.smtpPass} onChange={e => setSettings({ ...settings, smtpPass: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">From Address</label><input value={settings.smtpFrom} onChange={e => setSettings({ ...settings, smtpFrom: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <button onClick={() => setState(prev => ({ ...prev, emails: [...prev.emails, addEmail(prev, 'test@example.com', 'Test Email')], toasts: [...prev.toasts, addToast(prev, 'Test email sent!', 'success')] }))} className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: state.settings.themeColor }}>
              <Send size={14} /> Send Test Email
            </button>
            <div className="mt-4">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Recent Emails</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {state.emails.slice(-5).reverse().map(email => (
                  <div key={email.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <span className="text-gray-700">{email.subject}</span>
                    <Badge variant={email.status === 'delivered' ? 'success' : email.status === 'failed' ? 'danger' : 'info'}>{email.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t flex justify-end">
          <button onClick={handleSave} className="px-6 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: state.settings.themeColor }}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}

// Deploy View
function DeployView() {
  const { state } = useStore();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Deploy & System</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Zap size={18} /> Instance Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><Badge variant="success">Running</Badge></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Version</span><span className="text-gray-700">1.0.0</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Uptime</span><span className="text-gray-700">99.9%</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Storage Used</span><span className="text-gray-700">{(JSON.stringify(state).length / 1024).toFixed(1)} KB</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Shield size={18} /> Security Checklist</h3>
          <div className="space-y-2">
            {['Content Security Policy', 'X-Frame-Options: DENY', 'X-Content-Type-Options: nosniff', 'Referrer-Policy', 'Permissions-Policy', 'server_tokens off', 'Credential gating', 'Password masking'].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm"><Check size={14} className="text-green-500" /><span className="text-gray-700">{item}</span></div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Rocket size={18} /> Docker Commands</h3>
          <div className="space-y-2">
            {[
              'docker-compose up -d',
              'docker-compose logs -f',
              'docker-compose restart',
              'docker exec -it volunteerhub bash',
            ].map(cmd => (
              <div key={cmd} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <code className="text-sm text-green-400 font-mono">{cmd}</code>
                <button onClick={() => navigator.clipboard.writeText(cmd)} className="text-gray-400 hover:text-white text-xs">Copy</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

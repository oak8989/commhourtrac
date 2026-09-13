import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, Clock, User, LogOut, CheckCircle, MapPin, QrCode, FileText, Shield, Trash2, Eye, EyeOff, Award, ChevronRight } from 'lucide-react';
import { useStore, addToast, addActivity, getEventStatus, getEventRegistrations, calculateHours } from '../store';
import { Event } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Modal, ConfirmDialog, Badge, CapacityBar, PulsingDot, ProgressRing, CountUp, Logo } from '../components/UI';
import { EmailTemplates, sendMedalEmail, mailer } from '../mailer';
import { emailAPI } from '../emailAPI';

type MemberView = 'home' | 'events' | 'hours' | 'profile';

export default function MemberPortal({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { state, setState } = useStore();
  const [view, setView] = useState<MemberView>('home');
  const currentUser = state.currentUser;

  if (!currentUser) { onNavigate('login'); return null; }

  // Refresh user data from state
  const user = state.users.find(u => u.id === currentUser.id) || currentUser;

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null, toasts: [...prev.toasts, addToast(prev, 'Signed out', 'info')] }));
    onNavigate('landing');
  };

  const navItems = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'events' as const, icon: Calendar, label: 'Events' },
    { id: 'hours' as const, icon: Clock, label: 'My Hours' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Logo logo={state.settings.logo} size="md" />
              <span className="font-bold text-sm text-gray-900 hidden sm:block">{state.settings.orgName}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {navItems.map(item => (
                  <button key={item.id} onClick={() => setView(item.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === item.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                    <item.icon size={14} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-600" title="Sign Out"><LogOut size={18} /></button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {view === 'home' && <HomeView user={user} />}
        {view === 'events' && <EventsView user={user} />}
        {view === 'hours' && <HoursView user={user} />}
        {view === 'profile' && <ProfileView user={user} onNavigate={onNavigate} />}
      </div>
    </div>
  );
}

function HomeView({ user }: { user: any }) {
  const { state, setState } = useStore();
  const activeCheckin = state.attendance.find(a => a.userId === user.id && a.checkIn && !a.checkOut);
  const myRegistrations = state.registrations.filter(r => r.userId === user.id);
  const upcomingRegs = myRegistrations.filter(r => {
    const event = state.events.find(e => e.id === r.eventId);
    return event && getEventStatus(event) !== 'past';
  });

  const medals = state.settings.medals.filter(m => user.totalHours >= m.hoursRequired);
  const nextMedal = state.settings.medals.find(m => user.totalHours < m.hoursRequired);
  const progress = nextMedal ? (user.totalHours / nextMedal.hoursRequired) * 100 : 100;

  const handleCheckIn = () => {
    setState(prev => {
      const liveEvent = prev.events.find(e => getEventStatus(e) === 'live');
      if (!liveEvent) {
        return { ...prev, toasts: [...prev.toasts, addToast(prev, 'No live event to check in to', 'warning')] };
      }
      const existing = prev.attendance.find(a => a.userId === user.id && a.eventId === liveEvent.id);
      const currentUser = prev.currentUser || user;
      if (existing) {
        return {
          ...prev,
          attendance: prev.attendance.map(a => a.id === existing.id ? { ...a, checkIn: new Date().toISOString(), status: 'checked-in' as const } : a),
          toasts: [...prev.toasts, addToast(prev, 'Checked in!', 'success')],
        };
      } else {
        return {
          ...prev,
          attendance: [...prev.attendance, { id: uuidv4(), userId: user.id, eventId: liveEvent.id, checkIn: new Date().toISOString(), checkOut: null, isWalkIn: false, hours: 0, status: 'checked-in' as const }],
          activityLog: [{ id: uuidv4(), type: 'check-in' as const, userId: user.id, eventId: liveEvent.id, message: `${currentUser.name} checked in to ${liveEvent.title}`, timestamp: new Date().toISOString() }, ...prev.activityLog],
          toasts: [...prev.toasts, addToast(prev, 'Checked in!', 'success')],
        };
      }
    });
  };

  const handleCheckOut = () => {
    setState(prev => {
      const currentActive = prev.attendance.find(a => a.userId === user.id && a.checkIn && !a.checkOut);
      if (!currentActive) return prev;
      const hours = calculateHours(currentActive.checkIn, new Date().toISOString());
      const currentUser = prev.currentUser || user;
      const newTotalHours = currentUser.totalHours + hours;
      
      // Check for medal unlocks
      const medalsEarned = prev.settings.medals.filter(m => 
        newTotalHours >= m.hoursRequired && currentUser.totalHours < m.hoursRequired
      );
      
      let newActivityLog = [{ id: uuidv4(), type: 'check-out' as const, userId: user.id, message: `${currentUser.name} checked out (${hours}h)`, timestamp: new Date().toISOString() }, ...prev.activityLog];
      let newEmails = [...prev.emails];
      let newToasts = [...prev.toasts, addToast(prev, `Checked out! ${hours} hours logged`, 'success')];
      
      // Send medal notifications
      medalsEarned.forEach(medal => {
        newActivityLog = [{ id: uuidv4(), type: 'medal' as const, userId: user.id, message: `${currentUser.name} earned the ${medal.name} medal! ${medal.icon}`, timestamp: new Date().toISOString() }, ...newActivityLog];
        
        // Send medal email via real API
        const medalTemplate = EmailTemplates.medal(prev.settings.orgName, medal.name, medal.icon, newTotalHours);
        newEmails.push({ id: uuidv4(), to: currentUser.email, subject: medalTemplate.subject, status: 'queued' as const, createdAt: new Date().toISOString() });
        
        // Send asynchronously
        emailAPI.configure({
          host: prev.settings.smtpHost,
          port: prev.settings.smtpPort,
          user: prev.settings.smtpUser,
          pass: prev.settings.smtpPass,
          from: prev.settings.smtpFrom,
          fromName: prev.settings.orgName,
        }).then(() => {
          emailAPI.send(currentUser.email, medalTemplate.subject, medalTemplate.html, medalTemplate.text, 'medal');
        });
        
        newToasts = [...newToasts, addToast(prev, `🎉 Congratulations! You earned the ${medal.name} medal!`, 'success')];
      });
      
      return {
        ...prev,
        attendance: prev.attendance.map(a => a.id === currentActive.id ? { ...a, checkOut: new Date().toISOString(), hours, status: 'completed' as const } : a),
        users: prev.users.map(u => u.id === user.id ? { ...u, totalHours: newTotalHours } : u),
        currentUser: prev.currentUser ? { ...prev.currentUser, totalHours: newTotalHours } : null,
        activityLog: newActivityLog,
        emails: newEmails,
        toasts: newToasts,
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Next Shift Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Current Shift</h2>
          {activeCheckin && <PulsingDot />}
        </div>
        {activeCheckin ? (
          <div>
            <p className="text-sm text-gray-500 mb-2">You're currently checked in</p>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-mono font-bold text-green-600">
                <LiveTimerDisplay checkIn={activeCheckin.checkIn!} />
              </div>
              <button onClick={handleCheckOut} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Check Out</button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">No active shift. Check in to a live event.</p>
            <button onClick={handleCheckIn} className="px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: state.settings.themeColor }}>
              <CheckCircle size={16} className="inline mr-2" />Check In
            </button>
          </div>
        )}
      </motion.div>

      {/* Medal Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-4">Medal Progress</h2>
        <div className="flex items-center gap-6">
          <ProgressRing progress={progress} size={100} color={nextMedal?.color || state.settings.themeColor}>
            <div className="text-center">
              <span className="text-lg font-bold text-gray-900">{Math.round(progress)}%</span>
            </div>
          </ProgressRing>
          <div>
            <p className="text-sm text-gray-500">Next medal</p>
            {nextMedal ? (
              <>
                <p className="text-lg font-bold text-gray-900">{nextMedal.icon} {nextMedal.name}</p>
                <p className="text-sm text-gray-500">{user.totalHours}h / {nextMedal.hoursRequired}h</p>
              </>
            ) : (
              <p className="text-lg font-bold text-gray-900">All medals earned! 🎉</p>
            )}
            <div className="flex gap-1 mt-2">
              {state.settings.medals.map(m => (
                <span key={m.id} className={`text-lg ${user.totalHours >= m.hoursRequired ? '' : 'opacity-30'}`}>{m.icon}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upcoming Registrations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-4">Upcoming Registrations</h2>
        {upcomingRegs.length > 0 ? (
          <div className="space-y-3">
            {upcomingRegs.map(reg => {
              const event = state.events.find(e => e.id === reg.eventId);
              if (!event) return null;
              return (
                <div key={reg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">{new Date(event.startDate).toLocaleDateString()} • {event.location}</p>
                  </div>
                  <Badge variant={getEventStatus(event) === 'live' ? 'success' : 'info'}>{getEventStatus(event)}</Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-4">No upcoming registrations</p>
        )}
      </motion.div>
    </div>
  );
}

function LiveTimerDisplay({ checkIn }: { checkIn: string }) {
  const [time, setTime] = useState('');
  React.useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(checkIn).getTime();
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTime(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [checkIn]);
  return <>{time}</>;
}

function EventsView({ user }: { user: any }) {
  const { state, setState } = useStore();
  const [filter, setFilter] = useState<'upcoming' | 'live' | 'past'>('upcoming');
  const [showQR, setShowQR] = useState(false);
  const [, setTick] = useState(0);

  // Force re-render every 30s to update live event status
  React.useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const visibleEvents = useMemo(() => {
    return state.events.filter(e => {
      if (getEventStatus(e) !== filter) return false;
      if (e.isPublic) return true;
      return e.invitedGroups.some(g => user.groups.includes(g));
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [state.events, filter, user.groups]);

  const isRegistered = (eventId: string) => state.registrations.some(r => r.eventId === eventId && r.userId === user.id);

  const handleRegister = (event: Event) => {
    setState(prev => {
      const currentUser = prev.users.find(u => u.id === user.id) || user;
      if (event.requireWaiver && !currentUser.waiverSigned) {
        return { ...prev, toasts: [...prev.toasts, addToast(prev, 'Please sign the waiver first', 'warning')] };
      }
      const alreadyRegistered = prev.registrations.some(r => r.eventId === event.id && r.userId === user.id);
      if (alreadyRegistered) {
        return { ...prev, toasts: [...prev.toasts, addToast(prev, 'Already registered', 'info')] };
      }
      const regs = prev.registrations.filter(r => r.eventId === event.id);
      if (regs.length >= event.capacity) {
        return { ...prev, toasts: [...prev.toasts, addToast(prev, 'Event is full', 'error')] };
      }

      const receiptId = 'RCP-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      const hasPayment = event.fee > 0 && prev.settings.paymentsEnabled;
      const reg = {
        id: uuidv4(), userId: user.id, eventId: event.id,
        registeredAt: new Date().toISOString(), paid: hasPayment,
        refunded: false, receiptId: hasPayment ? receiptId : undefined,
      };
      const payment = hasPayment ? {
        id: uuidv4(), userId: user.id, eventId: event.id,
        amount: event.fee, method: 'card' as const, status: 'paid' as const,
        receiptId, createdAt: new Date().toISOString(),
      } : null;

      const activity = { id: uuidv4(), type: 'registration' as const, userId: user.id, eventId: event.id, message: `${currentUser.name} registered for ${event.title}`, timestamp: new Date().toISOString() };
      
      // Send registration confirmation email using template
      const eventDate = new Date(event.startDate).toLocaleString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: '2-digit'
      });
      const regTemplate = EmailTemplates.registration(prev.settings.orgName, event.title, eventDate, event.location);
      const emailMsg = { id: uuidv4(), to: currentUser.email, subject: regTemplate.subject, status: 'queued' as const, createdAt: new Date().toISOString() };
      
      // Send email via real API (async, don't await to avoid blocking UI)
      emailAPI.configure({
        host: prev.settings.smtpHost,
        port: prev.settings.smtpPort,
        user: prev.settings.smtpUser,
        pass: prev.settings.smtpPass,
        from: prev.settings.smtpFrom,
        fromName: prev.settings.orgName,
      }).then(() => {
        emailAPI.send(currentUser.email, regTemplate.subject, regTemplate.html, regTemplate.text, 'registration');
      });

      return {
        ...prev,
        registrations: [...prev.registrations, reg],
        payments: payment ? [...prev.payments, payment] : prev.payments,
        activityLog: [activity, ...prev.activityLog],
        emails: [...prev.emails, emailMsg],
        toasts: [...prev.toasts, addToast(prev, payment ? `Registered! Receipt: ${receiptId}` : 'Registered!', 'success')],
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Events</h1>
        <button onClick={() => setShowQR(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          <QrCode size={16} /> Scan QR
        </button>
      </div>

      <div className="flex gap-2">
        {(['upcoming', 'live', 'past'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visibleEvents.map(event => {
          const regs = getEventRegistrations(state, event.id);
          const registered = isRegistered(event.id);
          return (
            <motion.div key={event.id} layout className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    {getEventStatus(event) === 'live' && <PulsingDot />}
                    {event.fee > 0 && <Badge variant="info">${event.fee}</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={12} />{new Date(event.startDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} />{event.location}</span>
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-end gap-2">
                  <CapacityBar current={regs.length} max={event.capacity} />
                  {registered ? (
                    <Badge variant="success">✓ Registered</Badge>
                  ) : (
                    <button onClick={() => handleRegister(event)} className="px-3 py-1.5 text-white rounded-lg text-xs font-medium" style={{ backgroundColor: state.settings.themeColor }}>
                      Register
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {visibleEvents.length === 0 && <div className="text-center py-12 text-gray-400">No events in this category</div>}
      </div>

      {showQR && <QRScanner onClose={() => setShowQR(false)} />}
    </div>
  );
}

function QRScanner({ onClose }: { onClose: () => void }) {
  const { state, setState } = useStore();
  const [scanning, setScanning] = useState(true);
  const [success, setSuccess] = useState(false);
  const currentUser = state.currentUser!;

  const simulateScan = () => {
    setScanning(false);
    setTimeout(() => {
      setSuccess(true);
      // Use functional setState to avoid stale closure
      setState(prev => {
        const liveEvent = prev.events.find(e => getEventStatus(e) === 'live');
        if (!liveEvent) return prev;
        const userId = prev.currentUser?.id;
        if (!userId) return prev;
        const existing = prev.attendance.find(a => a.userId === userId && a.eventId === liveEvent.id);
        if (existing) return prev;
        return {
          ...prev,
          attendance: [...prev.attendance, { id: uuidv4(), userId, eventId: liveEvent.id, checkIn: new Date().toISOString(), checkOut: null, isWalkIn: true, hours: 0, status: 'checked-in' as const }],
          toasts: [...prev.toasts, addToast(prev, `Walk-in check-in to ${liveEvent.title}!`, 'success')],
        };
      });
    }, 1500);
  };

  return (
    <Modal isOpen onClose={onClose} title="Scan QR Code" size="sm">
      <div className="text-center">
        {scanning && !success && (
          <div>
            <div className="w-48 h-48 mx-auto border-4 border-dashed border-gray-300 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/20 to-transparent animate-bounce" style={{ height: '30%', animationDuration: '2s' }} />
              <QrCode size={48} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 mt-4">Position QR code within the frame</p>
            <button onClick={simulateScan} className="mt-4 px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: state.settings.themeColor }}>Simulate Scan</button>
          </div>
        )}
        {success && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="py-8">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <p className="text-lg font-bold text-gray-900">Success!</p>
            <p className="text-sm text-gray-500 mt-1">Walk-in recorded</p>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}

function HoursView({ user }: { user: any }) {
  const { state } = useStore();
  const myAttendance = state.attendance.filter(a => a.userId === user.id).sort((a, b) => {
    const dateA = a.checkIn ? new Date(a.checkIn).getTime() : 0;
    const dateB = b.checkIn ? new Date(b.checkIn).getTime() : 0;
    return dateB - dateA;
  });
  const totalHours = myAttendance.reduce((s, a) => s + a.hours, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Hours</h1>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900"><CountUp end={totalHours} suffix="h" /></p>
          <p className="text-xs text-gray-500">Total logged</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Event</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Check In</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Check Out</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Hours</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
            </tr>
          </thead>
          <tbody>
            {myAttendance.map(att => {
              const event = state.events.find(e => e.id === att.eventId);
              return (
                <tr key={att.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{event?.title || 'Unknown'}</td>
                  <td className="px-4 py-3 text-gray-500">{att.checkIn ? new Date(att.checkIn).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{att.checkIn ? new Date(att.checkIn).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{att.checkOut ? new Date(att.checkOut).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—'}</td>
                  <td className="px-4 py-3 font-medium">{att.hours > 0 ? `${att.hours}h` : (att.checkIn ? <span className="text-green-600">Active</span> : '—')}</td>
                  <td className="px-4 py-3">{att.isWalkIn ? <Badge variant="warning">Walk-in</Badge> : <Badge>Registered</Badge>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {myAttendance.length === 0 && <div className="text-center py-12 text-gray-400">No hours logged yet</div>}
      </div>
    </div>
  );
}

function ProfileView({ user, onNavigate }: { user: any; onNavigate: (page: string) => void }) {
  const { state, setState } = useStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone, title: user.title });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showDelete, setShowDelete] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);

  const handleSaveProfile = () => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === user.id ? { ...u, ...form } : u),
      currentUser: prev.currentUser ? { ...prev.currentUser, ...form } : null,
      toasts: [...prev.toasts, addToast(prev, 'Profile updated', 'success')],
    }));
    setEditing(false);
  };

  const handleChangePassword = () => {
    if (passwordForm.newPass !== passwordForm.confirm) {
      setState(prev => ({ ...prev, toasts: [...prev.toasts, addToast(prev, 'Passwords do not match', 'error')] }));
      return;
    }
    if (passwordForm.newPass.length < 6) {
      setState(prev => ({ ...prev, toasts: [...prev.toasts, addToast(prev, 'Password must be at least 6 characters', 'error')] }));
      return;
    }
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === user.id ? { ...u, password: passwordForm.newPass } : u),
      toasts: [...prev.toasts, addToast(prev, 'Password changed!', 'success')],
    }));
    setPasswordForm({ current: '', newPass: '', confirm: '' });
  };

  const handleDeleteAccount = () => {
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== user.id),
      attendance: prev.attendance.filter(a => a.userId !== user.id),
      registrations: prev.registrations.filter(r => r.userId !== user.id),
      payments: prev.payments.filter(p => p.userId !== user.id),
      currentUser: null,
      toasts: [...prev.toasts, addToast(prev, 'Account deleted', 'info')],
    }));
    onNavigate('landing');
  };

  const handleSignWaiver = () => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === user.id ? { ...u, waiverSigned: true, waiverSignedAt: new Date().toISOString() } : u),
      currentUser: prev.currentUser ? { ...prev.currentUser, waiverSigned: true, waiverSignedAt: new Date().toISOString() } : null,
      toasts: [...prev.toasts, addToast(prev, 'Waiver signed!', 'success')],
    }));
    setShowWaiver(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Profile</h2>
          {!editing && <button onClick={() => setEditing(true)} className="text-sm text-blue-600 hover:text-blue-700">Edit</button>}
        </div>
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-500 mb-1">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveProfile} className="px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: state.settings.themeColor }}>Save</button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{user.name}</span></div>
            <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900">{user.email}</span></div>
            <div><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-900">{user.phone || '—'}</span></div>
            <div><span className="text-gray-500">Title:</span> <span className="font-medium text-gray-900">{user.title || '—'}</span></div>
          </div>
        )}
      </motion.div>

      {/* Membership QR Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-4">Membership Card</h2>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
            <div className="text-center">
              <QrCode size={40} className="mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-400">{user.id.slice(0, 8)}</p>
            </div>
          </div>
          <div>
            <p className="font-bold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-sm text-gray-500 mt-1">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            <div className="flex gap-1 mt-2">
              {state.settings.medals.map(m => (
                <span key={m.id} className={`text-lg ${user.totalHours >= m.hoursRequired ? '' : 'opacity-20'}`}>{m.icon}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Waiver Status */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-4">Waiver</h2>
        {user.waiverSigned ? (
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-700">Waiver signed</p>
              <p className="text-xs text-gray-500">{user.waiverSignedAt ? new Date(user.waiverSignedAt).toLocaleDateString() : ''}</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">You need to sign a waiver before participating in certain events.</p>
            <button onClick={() => setShowWaiver(true)} className="px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: state.settings.themeColor }}>
              <FileText size={14} className="inline mr-2" />Review & Sign Waiver
            </button>
          </div>
        )}
      </motion.div>

      {/* Password Management */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-4">Change Password</h2>
        <div className="space-y-3 max-w-sm">
          <div><label className="block text-xs text-gray-500 mb-1">Current Password</label><input type="password" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">New Password</label><input type="password" value={passwordForm.newPass} onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Confirm New Password</label><input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <button onClick={handleChangePassword} className="px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: state.settings.themeColor }}>Update Password</button>
        </div>
      </motion.div>

      {/* Delete Account */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
        <h2 className="font-bold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-3">Permanently delete your account and all associated data.</p>
        <button onClick={() => setShowDelete(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
          <Trash2 size={14} className="inline mr-2" />Delete My Account
        </button>
      </motion.div>

      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDeleteAccount} title="Delete Account" message="This will permanently delete your account and all your data including attendance, registrations, and payments. This cannot be undone." confirmText="Delete Forever" danger />

      {/* Waiver Modal */}
      <Modal isOpen={showWaiver} onClose={() => setShowWaiver(false)} title="Waiver Agreement" size="md">
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{state.settings.waiverText}</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" id="waiver-agree" />
            <span>I have read and agree to the terms above</span>
          </label>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowWaiver(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
            <button onClick={handleSignWaiver} className="px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: state.settings.themeColor }}>
              <Shield size={14} className="inline mr-1" />Sign Waiver
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

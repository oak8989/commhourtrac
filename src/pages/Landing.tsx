import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Award, MapPin, ChevronRight, Heart, Star, ArrowRight } from 'lucide-react';
import { useStore, getEventStatus, getEventRegistrations } from '../store';
import { Event } from '../types';
import { CountUp, LiveClock, PulsingDot, Badge, CapacityBar, Logo } from '../components/UI';

export default function Landing({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { state } = useStore();
  const { settings } = state;
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    if (state.activityLog.length === 0) return;
    const timer = setInterval(() => {
      setTickerIndex(i => (i + 1) % state.activityLog.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [state.activityLog.length]);

  // Ensure tickerIndex is within bounds when activityLog changes
  const safeTickerIndex = state.activityLog.length > 0 ? tickerIndex % state.activityLog.length : 0;

  const publicEvents = state.events
    .filter(e => e.isPublic && getEventStatus(e) !== 'past')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const liveEvents = state.events.filter(e => getEventStatus(e) === 'live');
  const totalHours = state.users.reduce((s, u) => s + u.totalHours, 0);
  const totalVolunteers = state.users.filter(u => u.status === 'active').length;
  const totalEvents = state.events.filter(e => getEventStatus(e) === 'past').length;

  const accentStyle = { '--accent': settings.themeColor } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-white" style={accentStyle}>
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Logo logo={settings.logo} size="lg" />
              <span className="text-xl font-bold text-gray-900">{settings.orgName}</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('reset')} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Forgot Password?</button>
              <button onClick={() => onNavigate('login')} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Sign In</button>
              <button onClick={() => onNavigate('register')} className="px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: settings.themeColor }}>Get Started</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 30% 50%, ${settings.themeColor}, transparent 60%)` }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              {settings.tagline}
            </h1>
            <p className="text-xl text-gray-600 mb-8">{settings.mission.substring(0, 150)}...</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => onNavigate('register')} className="px-8 py-4 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: settings.themeColor }}>
                Join as Volunteer <ArrowRight className="inline ml-2" size={20} />
              </button>
              <button onClick={() => onNavigate('login')} className="px-8 py-4 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all">
                Member Sign In
              </button>
            </div>
            <div className="mt-6 text-center">
              <button onClick={() => onNavigate('reset')} className="text-sm text-gray-500 hover:text-gray-700 underline">
                Forgot your password? Reset it here
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Front Desk */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Clock */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <PulsingDot />
                <span className="text-sm font-medium text-gray-500">LIVE FRONT DESK</span>
              </div>
              <LiveClock />
              <div className="mt-4 text-sm text-gray-500">
                {state.attendance.filter(a => a.checkIn && !a.checkOut).length} volunteers currently active
              </div>
            </motion.div>

            {/* Activity Ticker */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Heart size={18} style={{ color: settings.themeColor }} />
                <span className="text-sm font-medium text-gray-500">ACTIVITY FEED</span>
              </div>
              <div className="h-24 flex items-center justify-center overflow-hidden">
                {state.activityLog.length > 0 && (
                  <motion.p
                    key={safeTickerIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center text-gray-700"
                  >
                    {state.activityLog[safeTickerIndex]?.message}
                  </motion.p>
                )}
              </div>
              <div className="flex justify-center gap-1 mt-2">
                {state.activityLog.slice(0, 5).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === safeTickerIndex % 5 ? 'bg-green-600' : 'bg-gray-200'}`} />
                ))}
              </div>
            </motion.div>

            {/* Live Events */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} style={{ color: settings.themeColor }} />
                <span className="text-sm font-medium text-gray-500">LIVE EVENTS</span>
              </div>
              {liveEvents.length > 0 ? (
                <div className="space-y-3">
                  {liveEvents.map(event => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <PulsingDot color="bg-green-500" />
                      <div>
                        <p className="font-medium text-sm text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">No events currently live</p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Band */}
      <section className="py-16" style={{ backgroundColor: settings.themeColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl lg:text-5xl font-bold"><CountUp end={totalHours} suffix="+" /></div>
              <p className="mt-2 text-white/80">Volunteer Hours</p>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold"><CountUp end={totalVolunteers} /></div>
              <p className="mt-2 text-white/80">Active Volunteers</p>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold"><CountUp end={totalEvents + state.events.length} /></div>
              <p className="mt-2 text-white/80">Events Held</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
            <p className="mt-2 text-gray-600">Find opportunities to make a difference</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicEvents.slice(0, 6).map((event, i) => {
              const regs = getEventRegistrations(state, event.id);
              const status = getEventStatus(event);
              return (
                <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      {status === 'live' && <Badge variant="success"><span className="flex items-center gap-1"><PulsingDot color="bg-green-500" /> Live</span></Badge>}
                      {event.isRecurring && <Badge variant="warning">{event.recurrenceType}</Badge>}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2"><Calendar size={14} />{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="flex items-center gap-2"><Clock size={14} />{new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {new Date(event.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                      <div className="flex items-center gap-2"><MapPin size={14} />{event.location}</div>
                    </div>
                    <div className="mt-4">
                      <CapacityBar current={regs.length} max={event.capacity} />
                    </div>
                  </div>
                  <div className="px-6 py-3 bg-gray-50 border-t">
                    <button onClick={() => onNavigate('register')} className="w-full text-center text-sm font-medium" style={{ color: settings.themeColor }}>
                      Register Now <ChevronRight size={14} className="inline" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Star size={40} style={{ color: settings.themeColor }} className="mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed">{settings.mission}</p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <Award size={24} style={{ color: settings.themeColor }} className="mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Earn Medals</h3>
              <p className="text-sm text-gray-500 mt-1">Recognition for your service hours</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <Users size={24} style={{ color: settings.themeColor }} className="mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Join Community</h3>
              <p className="text-sm text-gray-500 mt-1">Connect with fellow volunteers</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <Heart size={24} style={{ color: settings.themeColor }} className="mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Make Impact</h3>
              <p className="text-sm text-gray-500 mt-1">Track your contribution to the community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Logo logo={settings.logo} size="md" />
                <span className="font-bold text-lg">{settings.orgName}</span>
              </div>
              <p className="text-gray-400 text-sm">{settings.tagline}</p>
              <p className="text-gray-500 text-xs mt-2">EIN: {settings.ein}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>{settings.contactEmail}</p>
                <p>{settings.contactPhone}</p>
                <p>{settings.address}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Links</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <button onClick={() => onNavigate('reset')} className="block hover:text-white text-left">Reset Password</button>
                <a href="#" className="block hover:text-white">Privacy Policy</a>
                <a href="#" className="block hover:text-white">Terms of Service</a>
                <a href="https://github.com" target="_blank" rel="noopener" className="flex items-center gap-2 hover:text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {settings.orgName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

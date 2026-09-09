import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useStore, addToast, addActivity, addEmail } from '../store';
import { v4 as uuidv4 } from 'uuid';

export default function Auth({ mode, onNavigate }: { mode: 'login' | 'register' | 'reset' | 'first-run'; onNavigate: (page: string) => void }) {
  const { state, setState } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) { setError('Invalid email or password'); return; }
    if (user.status === 'inactive') { setError('Account is inactive. Contact admin.'); return; }
    setState(prev => ({ ...prev, currentUser: user, toasts: [...prev.toasts, addToast(prev, `Welcome back, ${user.name}!`, 'success')] }));
    onNavigate(user.role === 'admin' ? 'admin' : 'member');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) { setError('All fields are required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (state.users.find(u => u.email.toLowerCase() === email.toLowerCase())) { setError('Email already registered'); return; }

    const newUser = {
      id: uuidv4(), email, password, name, phone, title: 'Volunteer', role: 'member' as const,
      groups: ['General'], status: 'active' as const, createdAt: new Date().toISOString(),
      totalHours: 0, waiverSigned: false,
    };

    const activity = addActivity(state, { type: 'member-added', userId: newUser.id, message: `${name} registered as a new volunteer` });
    const emailMsg = addEmail(state, email, 'Welcome to ' + state.settings.orgName);

    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      activityLog: [activity, ...prev.activityLog],
      emails: [...prev.emails, emailMsg],
      currentUser: newUser,
      toasts: [...prev.toasts, addToast(prev, 'Account created! Welcome aboard!', 'success')],
    }));
    onNavigate('member');
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) { setError('Email not found'); return; }
    const emailMsg = addEmail(state, email, 'Password Reset Link');
    setState(prev => ({
      ...prev,
      emails: [...prev.emails, emailMsg],
      toasts: [...prev.toasts, addToast(prev, 'Reset link sent to your email', 'success')],
    }));
    setSuccess('Password reset link sent! Check your email.');
  };

  const isFirstRun = mode === 'first-run';
  const adminUser = state.users.find(u => u.role === 'admin');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <span className="text-4xl">{state.settings.logo}</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-4">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Join Our Community'}
              {mode === 'reset' && 'Reset Password'}
              {isFirstRun && 'First Time Setup'}
            </h1>
            <p className="text-gray-500 mt-1">
              {mode === 'login' && 'Sign in to your account'}
              {mode === 'register' && 'Create your volunteer account'}
              {mode === 'reset' && 'We\'ll send you a reset link'}
              {isFirstRun && 'Please change the default admin password'}
            </p>
          </div>

          {isFirstRun && adminUser && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">Provisioned Credentials</span>
              </div>
              <p className="text-sm text-amber-600">Email: <code className="bg-amber-100 px-1 rounded">{adminUser.email}</code></p>
              <p className="text-sm text-amber-600">Password: <code className="bg-amber-100 px-1 rounded">{adminUser.password}</code></p>
              <p className="text-xs text-amber-500 mt-2">⚠️ Change this password after first login!</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={16} />{error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {success}
            </div>
          )}

          {(mode === 'login' || isFirstRun) && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button type="submit" className="w-full py-3 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all" style={{ backgroundColor: state.settings.themeColor }}>
                Sign In
              </button>
              <div className="text-center text-sm">
                <button type="button" onClick={() => onNavigate('reset')} className="text-gray-500 hover:text-gray-700">Forgot password?</button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
              </div>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 chars)" className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone (optional)" className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
              </div>
              <button type="submit" className="w-full py-3 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all" style={{ backgroundColor: state.settings.themeColor }}>
                Create Account
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
              </div>
              <button type="submit" className="w-full py-3 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all" style={{ backgroundColor: state.settings.themeColor }}>
                Send Reset Link
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button onClick={() => onNavigate('landing')} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft size={16} /> Back to home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

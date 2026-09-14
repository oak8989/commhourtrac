import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useStore, addToast } from '../store';
import { Logo } from '../components/UI';

export default function ResetPassword({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { state, setState } = useStore();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extract token and email from URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');
    
    if (urlToken) setToken(urlToken);
    if (urlEmail) setEmail(decodeURIComponent(urlEmail));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!token || !email) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Find user by email
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      setError('User not found');
      return;
    }

    // Update password
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => 
        u.id === user.id ? { ...u, password: newPassword } : u
      ),
      toasts: [...prev.toasts, addToast(prev, 'Password reset successfully! Please sign in.', 'success')],
    }));

    setSuccess(true);
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      onNavigate('login');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Logo logo={state.settings.logo} size="xl" className="inline-block" />
            <h1 className="text-2xl font-bold text-gray-900 mt-4">
              {success ? 'Password Reset!' : 'Set New Password'}
            </h1>
            <p className="text-gray-500 mt-1">
              {success 
                ? 'Your password has been reset successfully' 
                : 'Enter your new password below'}
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
              <p className="text-gray-600 mb-4">
                Redirecting to login page...
              </p>
              <button
                onClick={() => onNavigate('login')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Go to login now
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle size={16} />{error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                  style={{ backgroundColor: state.settings.themeColor }}
                >
                  Reset Password
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={16} /> Back to home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

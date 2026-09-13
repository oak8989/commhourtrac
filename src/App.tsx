import React, { useState, useCallback, useEffect } from 'react';
import { AppState } from './types';
import { StoreContext, loadState, saveState } from './store';
import { ToastContainer, FilmGrain } from './components/UI';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import MemberPortal from './pages/Member';

type Page = 'landing' | 'login' | 'register' | 'reset' | 'first-run' | 'admin' | 'member';

export default function App() {
  const [initialState] = useState<AppState>(() => loadState());
  const [state, setStateRaw] = useState<AppState>(initialState);
  const [page, setPage] = useState<Page>(() => {
    if (initialState.currentUser) return initialState.currentUser.role === 'admin' ? 'admin' : 'member';
    return 'landing';
  });

  const setState = useCallback((fn: (prev: AppState) => AppState) => {
    setStateRaw(prev => {
      const next = fn(prev);
      saveState(next);
      return next;
    });
  }, []);

  const handleNavigate = (newPage: string) => {
    setPage(newPage as Page);
  };

  const dismissToast = useCallback((id: string) => {
    setState(prev => ({ ...prev, toasts: prev.toasts.filter(t => t.id !== id) }));
  }, [setState]);

  // Update CSS variables when theme color changes
  useEffect(() => {
    const themeColor = state.settings.themeColor;
    document.documentElement.style.setProperty('--theme-color', themeColor);
    
    // Generate lighter and darker variants
    const hex = themeColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Lighter variant (20% lighter)
    const lighterR = Math.min(255, Math.round(r + (255 - r) * 0.2));
    const lighterG = Math.min(255, Math.round(g + (255 - g) * 0.2));
    const lighterB = Math.min(255, Math.round(b + (255 - b) * 0.2));
    const lighterColor = `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
    
    // Darker variant (20% darker)
    const darkerR = Math.max(0, Math.round(r * 0.8));
    const darkerG = Math.max(0, Math.round(g * 0.8));
    const darkerB = Math.max(0, Math.round(b * 0.8));
    const darkerColor = `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
    
    document.documentElement.style.setProperty('--theme-color-light', lighterColor);
    document.documentElement.style.setProperty('--theme-color-dark', darkerColor);
  }, [state.settings.themeColor]);

  // Check if first run (admin password hasn't been changed)
  const isFirstRun = page === 'landing' && state.users.some(u => u.role === 'admin' && u.password === 'admin123');

  return (
    <StoreContext.Provider value={{ state, setState }}>
      <div className="relative min-h-screen">
        <FilmGrain />
        <ToastContainer toasts={state.toasts} onDismiss={dismissToast} />

        {page === 'landing' && <Landing onNavigate={handleNavigate} />}
        {page === 'login' && <Auth mode="login" onNavigate={handleNavigate} />}
        {page === 'register' && <Auth mode="register" onNavigate={handleNavigate} />}
        {page === 'reset' && <Auth mode="reset" onNavigate={handleNavigate} />}
        {page === 'first-run' && <Auth mode="first-run" onNavigate={handleNavigate} />}
        {page === 'admin' && <Admin onNavigate={handleNavigate} />}
        {page === 'member' && <MemberPortal onNavigate={handleNavigate} />}

        {/* First run hint */}
        {isFirstRun && page === 'landing' && (
          <div className="fixed bottom-4 left-4 z-50 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg max-w-xs">
            <p className="text-xs font-medium text-amber-700 mb-1">👋 First visit?</p>
            <p className="text-xs text-amber-600">Admin: admin@communityvolunteers.org / admin123</p>
            <button onClick={() => setPage('first-run')} className="mt-2 text-xs font-medium text-amber-800 underline">Sign in as admin →</button>
          </div>
        )}
      </div>
    </StoreContext.Provider>
  );
}

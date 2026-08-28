/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const STORAGE_KEY = 'bulldogex-session';
const AuthContext = createContext(null);

const storedSession = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(storedSession);
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  useEffect(() => {
    const validateSession = async () => {
      if (!session?.token) return setLoading(false);
      try {
        const response = await fetch(`${API_URL}/user/me`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (!response.ok) throw new Error('Session expired');
        const { user } = await response.json();
        const nextSession = { token: session.token, user };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
        setSession(nextSession);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    validateSession();
  // Validate once during application startup; saving the refreshed user must not retrigger it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSession = ({ token, user }) => {
    const nextSession = { token, user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const value = useMemo(() => ({
    user: session?.user || null,
    token: session?.token || null,
    isAdmin: session?.user?.userRole === 'admin',
    isSupplier: session?.user?.userRole === 'supplier',
    loading,
    saveSession,
    logout: clearSession,
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
};

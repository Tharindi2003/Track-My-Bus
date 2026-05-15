// src/hooks/useAuth.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSavedSession, getUserProfile, logout as logoutService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getSavedSession();
        if (session) {
          const p = await getUserProfile(session.uid);
          if (p) {
            setUser({ uid: session.uid, token: session.token });
            setProfile(p);
          }
        }
      } catch (e) {
        console.log('Session check error:', e);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  // ✅ This clears state so app navigates back to login
  async function logout() {
    await logoutService();
    setUser(null);
    setProfile(null);
  }

  const refreshProfile = async () => {
    if (user) {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, setProfile, setUser, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
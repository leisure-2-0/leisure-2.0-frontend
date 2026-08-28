import { useState } from 'react';
import { AuthContext } from './auth-context.js';

// mock auth state — there's no real backend auth wired up yet, so this just tracks
// whether a "user" is logged in and holds the bits the header/mypage need to display.
const DEFAULT_PROFILE = {
  email: 'yeoga@example.com',
  nickname: '여가러버',
  points: '1,240P',
  avatarUrl: null,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (profile) => setUser({ ...DEFAULT_PROFILE, ...profile });
  const logout = () => setUser(null);
  const updateProfile = (updates) => setUser((current) => (current ? { ...current, ...updates } : current));

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

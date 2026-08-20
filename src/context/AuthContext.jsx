import { useState } from 'react';
import { AuthContext } from './auth-context.js';

// mock auth state — there's no real backend auth wired up yet, so this just tracks
// whether a "user" is logged in and holds the bits the header needs to display.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = () => setUser({ points: '1,240P' });
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

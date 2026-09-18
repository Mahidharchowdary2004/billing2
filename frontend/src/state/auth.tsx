import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { MOCK_USERS, MockUser } from '../data/users';

interface AuthContextValue {
  user: MockUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);

  const login = useCallback((username: string, password: string) => {
    const match = MOCK_USERS.find((u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);
    if (match) {
      setUser(match);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

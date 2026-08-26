import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { TOKEN_KEY, USER_KEY } from '../services/api';
import type { User, UserRole } from '../types';

import { registerKnownUsers } from '../services/userDirectory';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; phone: string; password: string; role: UserRole }) => Promise<void>;
  updateProfile: (payload: { name?: string; phone?: string; password?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedToken && savedUser) {
        const parsed = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsed);
        registerKnownUsers([parsed]);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const { data } = await api.post<{ token: string; user: User }>('/auth/login', credentials);
    setToken(data.token);
    setUser(data.user);
    registerKnownUsers([data.user]);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  };

  const register = async (payload: { name: string; email: string; phone: string; password: string; role: UserRole }) => {
    const { data } = await api.post<{ token: string; user: User }>('/auth/register', payload);
    setToken(data.token);
    setUser(data.user);
    registerKnownUsers([data.user]);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  };

  const updateProfile = async (payload: { name?: string; phone?: string; password?: string }) => {
    const { data } = await api.put<{ user: User }>('/auth/profile', payload);
    setUser(data.user);
    registerKnownUsers([data.user]);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

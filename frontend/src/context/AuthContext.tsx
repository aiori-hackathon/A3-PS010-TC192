import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TokenResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: { email: string; password: string; full_name: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('netevidence_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('netevidence_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const freshUser = await api.getMe();
          setUser(freshUser);
          localStorage.setItem('netevidence_user', JSON.stringify(freshUser));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    const res: TokenResponse = await api.login(credentials);
    localStorage.setItem('netevidence_token', res.access_token);
    localStorage.setItem('netevidence_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
  };

  const register = async (payload: { email: string; password: string; full_name: string }) => {
    const res: TokenResponse = await api.register(payload);
    localStorage.setItem('netevidence_token', res.access_token);
    localStorage.setItem('netevidence_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('netevidence_token');
    localStorage.removeItem('netevidence_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
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

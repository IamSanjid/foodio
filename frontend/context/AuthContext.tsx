'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  login as loginRequest,
  register as registerRequest,
} from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/errors';
import { LoginInput, RegisterInput } from '@/lib/schemas';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginInput) => Promise<void>;
  register: (userData: RegisterInput) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser) as User);
      } else {
        setUser(null);
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: LoginInput) => {
    try {
      const data = await loginRequest(credentials);
      setUser(data.user);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to login'));
    }
  };

  const register = async (userData: RegisterInput) => {
    try {
      await registerRequest(userData);
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to register'));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

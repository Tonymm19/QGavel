import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';

interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  organization_id: string | null;
  organization_name: string | null;
  role: string;
}

interface AuthContextType {
  token: string | null;
  userEmail: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem('authToken');
};

const getInitialEmail = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem('authEmail');
};

const getInitialUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const userStr = window.localStorage.getItem('authUser');
  return userStr ? JSON.parse(userStr) : null;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8000/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('AuthProvider render start');
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [userEmail, setUserEmail] = useState<string | null>(getInitialEmail);
  const [user, setUser] = useState<User | null>(getInitialUser);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/auth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorMessage = 'Unable to sign in. Check your credentials.';
      try {
        const data = await response.json();
        if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length > 0) {
          errorMessage = data.non_field_errors[0];
        }
      } catch (error) {
        // Ignore JSON parsing errors
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const authToken = data?.token;
    if (!authToken) {
      throw new Error('Authentication token missing in response.');
    }

    const userData: User = {
      user_id: data.user_id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: data.full_name,
      organization_id: data.organization_id,
      organization_name: data.organization_name,
      role: data.role,
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('authToken', authToken);
      window.localStorage.setItem('authEmail', email);
      window.localStorage.setItem('authUser', JSON.stringify(userData));
      window.localStorage.setItem('token', authToken); // For API calls
    }
    setToken(authToken);
    setUserEmail(email);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('authToken');
      window.localStorage.removeItem('authEmail');
      window.localStorage.removeItem('authUser');
      window.localStorage.removeItem('token');
    }
    setToken(null);
    setUserEmail(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ token, userEmail, user, login, logout }),
    [token, userEmail, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

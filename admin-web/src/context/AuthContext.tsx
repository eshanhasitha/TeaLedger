/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, SignupFormData, AuthContextType } from '../types/auth.types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'tealedger_auth_token';
const USER_KEY = 'tealedger_auth_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      if (token && user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    } catch (err) {
      console.error('Failed to sync auth state to localStorage', err);
    }
  }, [token, user]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate network request latency
      await new Promise((resolve) => setTimeout(resolve, 850));

      const { email, password } = credentials;

      if (!email || !password) {
        throw new Error('Please enter both your work email and password.');
      }

      if (!email.includes('@')) {
        throw new Error('Please enter a valid work email address.');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters in length.');
      }

      // Generate mock session user & token
      const isSunil = email.toLowerCase().includes('sunil') || email.toLowerCase().includes('admin');
      
      const loggedUser: User = {
        id: isSunil ? 'usr-admin-01' : `usr-${Date.now()}`,
        name: isSunil ? 'Sunil Jayawardena' : email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: email.toLowerCase(),
        role: isSunil ? 'Chief Estate Admin' : 'Estate Administrator',
        division: 'Nuwara Eliya Central',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=120&h=120&q=80',
      };

      const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ sub: loggedUser.id, role: loggedUser.role, exp: Date.now() + 86400000 })
      )}.tealedger_signature_${Math.random().toString(36).substring(2)}`;

      setUser(loggedUser);
      setToken(mockJwt);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (formData: SignupFormData): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { name, email, division, inviteCode, password, confirmPassword, acceptTerms } = formData;

      if (!name.trim()) throw new Error('Please provide your full legal name.');
      if (!email.trim() || !email.includes('@')) throw new Error('A valid estate email address is required.');
      if (!acceptTerms) throw new Error('You must accept the Operational Terms & Data Protection Policy.');
      if (password !== confirmPassword) throw new Error('Passwords do not match.');
      if (password.length < 8) throw new Error('Password must be at least 8 characters long.');

      // Check access passcode
      const validCodes = ['ESTATE-2024', 'TEALEDGER-ADMIN', 'ADMIN-NUWARA', 'CEYLON-TEA', 'DEMO-ACCESS'];
      const normalizedCode = inviteCode.trim().toUpperCase();
      if (!inviteCode.trim() || (!validCodes.includes(normalizedCode) && !normalizedCode.startsWith('ESTATE-'))) {
        throw new Error('Invalid Administrator Access Passcode. Contact Central Estate HQ for an invite code (Try: ESTATE-2024).');
      }

      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'Estate Administrator',
        division: division || 'Nuwara Eliya Central',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=120&h=120&q=80',
      };

      const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ sub: newUser.id, role: newUser.role, exp: Date.now() + 86400000 })
      )}.tealedger_signature_${Math.random().toString(36).substring(2)}`;

      setUser(newUser);
      setToken(mockJwt);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        signup,
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

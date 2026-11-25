import { useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, SignupFormData } from '../types/auth.types';
import { AuthContext } from './authContextDef';
import { authService } from '../services/authService';

const TOKEN_KEY = 'tealedger_token';
const USER_KEY = 'tealedger_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY) || localStorage.getItem('tealedger_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('tealedger_auth_token') || null;
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
        localStorage.setItem('tealedger_auth_token', token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        localStorage.setItem('tealedger_auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('tealedger_auth_token');
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('tealedger_auth_user');
      }
    } catch (err: unknown) {
      console.error('Failed to sync auth state to localStorage', err);
    }
  }, [token, user]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const { user: loggedUser, token: authToken } = await authService.login(credentials);
      setUser(loggedUser);
      setToken(authToken);
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
      localStorage.removeItem('tealedger_auth_token');
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('tealedger_auth_user');
    } catch (err: unknown) {
      console.error('Failed to clear auth state from localStorage', err);
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

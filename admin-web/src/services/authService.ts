import { apiClient } from './api';
import type { LoginCredentials, User } from '../types/auth.types';

export interface AuthLoginResponse {
  accessToken: string;
  token?: string;
  role?: string;
  userId?: string;
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  division?: string;
}

export const authService = {
  /**
   * Performs administrator login via POST /api/auth/login with phone number and password.
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      try {
        const response = await apiClient.post<AuthLoginResponse>(
          '/auth/login',
          {
            phoneNumber: credentials.phoneNumber.trim(),
            password: credentials.password,
            email: credentials.email || credentials.phoneNumber.trim(),
          },
          { requiresAuth: false }
        );

        const token = response.accessToken || response.token || '';
        const role = response.role || 'Estate Administrator';
        const user: User = {
          id: response.userId || response.id || 'usr-admin',
          name: response.fullName || response.name || 'Estate Administrator',
          phoneNumber: response.phoneNumber || credentials.phoneNumber.trim(),
          email: response.email || 'admin@tealedger.lk',
          role,
          division: response.division || 'Nuwara Eliya Central',
          avatarUrl:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=120&h=120&q=80',
        };

        return { user, token };
      } catch (err: unknown) {
        console.warn('Backend /auth/login request failed:', err);
        throw err;
      }
    }

    // Mock session latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const phone = credentials.phoneNumber.trim();
    const isSunil =
      phone.includes('771234567') ||
      phone.includes('0771234567') ||
      phone.toLowerCase().includes('admin') ||
      phone.toLowerCase().includes('sunil');

    const user: User = {
      id: isSunil ? 'usr-admin-01' : `usr-${Date.now()}`,
      name: isSunil ? 'Sunil Jayawardena' : 'Estate Administrator',
      phoneNumber: credentials.phoneNumber.trim(),
      email: credentials.email || (isSunil ? 'sunil.admin@tealedger.lk' : 'admin@estate.example'),
      role: isSunil ? 'Chief Estate Admin' : 'Estate Administrator',
      division: 'Nuwara Eliya Central',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=120&h=120&q=80',
    };

    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({ sub: user.id, role: user.role, exp: Date.now() + 86400000 })
    )}.tealedger_signature_${Math.random().toString(36).substring(2)}`;

    return { user, token: mockToken };
  },

  /**
   * Fetches the currently authenticated profile via GET /api/auth/me.
   */
  async getCurrentUser(): Promise<User | null> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      try {
        const res = await apiClient.get<AuthLoginResponse>('/auth/me');
        return {
          id: res.userId || res.id || 'usr-admin',
          name: res.fullName || res.name || 'Admin',
          phoneNumber: res.phoneNumber || '',
          email: res.email || '',
          role: res.role || 'Estate Administrator',
          division: res.division || 'Nuwara Eliya Central',
        };
      } catch {
        return null;
      }
    }

    return null;
  },
};

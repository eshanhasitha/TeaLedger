export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  division: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupFormData {
  name: string;
  email: string;
  division: string;
  inviteCode: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (formData: SignupFormData) => Promise<void>;
  logout: () => void;
}


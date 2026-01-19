export interface User {
  id: string;
  email: string;
  role: string;
  member?: {
    id: string;
    full_name: string;
    phone?: string;
    image_url?: string;
  };
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Role {
  id: string;
  name: string;
}

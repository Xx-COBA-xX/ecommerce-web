const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  set: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },
};

export const userStorage = {
  get: () => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  set: (user: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  },
};

export const isAdmin = (role?: string): boolean => {
  return role === 'admin';
};

export const hasRole = (userRole?: string, requiredRole?: string): boolean => {
  if (!requiredRole) return true;
  return userRole === requiredRole;
};

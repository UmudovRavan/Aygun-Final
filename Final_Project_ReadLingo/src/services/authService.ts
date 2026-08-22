import { apiPost, setTokens, clearTokens, getAccessToken, getRefreshToken } from './api/client';

export interface AuthResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiPost<AuthResponse>('/auth/login', { email, password });
    if (res.accessToken) {
      setTokens(res.accessToken, res.refreshToken);
      localStorage.setItem('user', res.email);
      localStorage.setItem('user_role', res.roles?.[0] || 'User');
    }
    return res;
  },

  register: async (name: string, email: string, password: string): Promise<any> => {
    let cleanName = name.trim();
    if (cleanName.includes('@')) {
      cleanName = cleanName.split('@')[0];
    }
    const nameParts = cleanName.split(' ');
    const firstName = nameParts[0] || (email ? email.split('@')[0] : 'User');
    const lastName = nameParts.slice(1).join(' ') || '';

    const res = await apiPost<any>('/auth/register', {
      firstName,
      lastName,
      email,
      password,
      confirmPassword: password,
    });
    return res;
  },

  logout: async (refreshToken?: string): Promise<void> => {
    try {
      const token = refreshToken || getRefreshToken();
      if (token) {
        await apiPost('/auth/logout', { refreshToken: token });
      }
    } catch (e) {
      console.warn('Logout API warning:', e);
    } finally {
      clearTokens();
      localStorage.removeItem('user');
      localStorage.removeItem('user_role');
      sessionStorage.clear();
    }
  },

  forgotPassword: async (email: string): Promise<any> => {
    return await apiPost('/auth/forgot-password', { email });
  },

  resetPassword: async (email: string, token: string, newPassword: string): Promise<any> => {
    return await apiPost('/auth/reset-password', { email, token, newPassword, confirmPassword: newPassword });
  },

  confirmEmail: async (userId: string, token: string): Promise<any> => {
    return await apiPost('/auth/confirm-email', { userId, token });
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<any> => {
    return await apiPost('/auth/change-password', { currentPassword, newPassword, confirmPassword: newPassword });
  },

  isAuthenticated: (): boolean => !!getAccessToken() || !!getRefreshToken(),

  getUserRole: (): string => {
    return localStorage.getItem('user_role') || 'User';
  },

  isAdmin: (): boolean => {
    if (localStorage.getItem('user_role') === 'Admin' || sessionStorage.getItem('adminAuth') === 'true') {
      return true;
    }

    const token = getAccessToken();
    if (!token) return false;
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return false;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const parsed = JSON.parse(jsonPayload);

      // Check roles in token claims
      const roleClaim =
        parsed['role'] ||
        parsed['roles'] ||
        parsed['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (Array.isArray(roleClaim)) {
        return roleClaim.includes('Admin');
      }
      return roleClaim === 'Admin';
    } catch {
      return false;
    }
  },
};


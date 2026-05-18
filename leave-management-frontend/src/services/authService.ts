import api from './api';
import type { LoginCredentials, User } from '../types';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
  joiningCode: string;
  role?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
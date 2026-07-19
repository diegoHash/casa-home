import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168');
const API_URL = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:9590/etecc/cbt/auth' : 'https://gateway.caribbean-one.site/etecc/cbt/auth');
const REQUEST_TIMEOUT_MS = 15000;

const api = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAuthErrorMessage = (error: any, fallback: string) => {
  if (error.code === 'ECONNABORTED') {
    return 'El servidor esta tardando demasiado. Intenta de nuevo en unos segundos.';
  }
  return error.response?.data?.message || fallback;
};

export const AuthService = {
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/login', { username, password });
      return { success: true, ...response.data };
    } catch (error: any) {
      return {
        success: false,
        error: getAuthErrorMessage(error, 'Error de autenticacion')
      };
    }
  },

  register: async (username: string, password: string) => {
    try {
      const response = await api.post('/register', { username, password });
      return { success: true, ...response.data };
    } catch (error: any) {
      return {
        success: false,
        error: getAuthErrorMessage(error, 'Error al registrar')
      };
    }
  },

  requestRecoveryLink: async (username: string, method: string) => {
    try {
      const response = await api.post('/request-otp', { username, method });
      return { success: true, ...response.data };
    } catch (error: any) {
      return {
        success: false,
        error: getAuthErrorMessage(error, 'Error al solicitar recuperacion')
      };
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await api.post('/reset-password', { token, newPassword });
      return { success: true, ...response.data };
    } catch (error: any) {
      return {
        success: false,
        error: getAuthErrorMessage(error, 'Error al restablecer contrasena')
      };
    }
  }
};

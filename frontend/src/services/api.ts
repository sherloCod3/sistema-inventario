// src/services/api.ts
import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

// Remover o request interceptor de autenticação
api.interceptors.request.use(
  (config) => config,
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

interface ErrorResponseData {
    message?: string;
}

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Tratamento de erros de conexão
      if (!error.response) {
        return Promise.reject(new Error('Erro de conexão com o servidor. Verifique sua conexão.'));
      }

      // Tratamento de erros do servidor
      const data = error.response.data as ErrorResponseData;
      const message = data.message || 'Ocorreu um erro inesperado.';
      return Promise.reject(new Error(message));
    }
);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@InventorySystem:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

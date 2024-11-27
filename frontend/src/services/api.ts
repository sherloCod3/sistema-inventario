import axios from 'axios';

const api = axios.create({
  baseURL: localStorage.getItem('@InventorySystem:apiUrl') || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

api.interceptors.request.use(
  (config) => {
    // Atualiza a baseURL em cada requisição
    config.baseURL = localStorage.getItem('@InventorySystem:apiUrl') || config.baseURL;
    
    const token = localStorage.getItem('@InventorySystem:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Erro de conexão. Verifique sua rede.'));
    }
    return Promise.reject(error.response.data?.message || 'Erro inesperado');
  }
);

export default api;
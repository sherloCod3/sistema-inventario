import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

interface User {
  username: string;
  role: string;
}

interface AuthContextData {
  user: User | null;
  signed: boolean;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const loadStoredData = () => {
      const storedToken = localStorage.getItem('@InventorySystem:token');
      const storedUser = localStorage.getItem('@InventorySystem:user');

      if (storedToken && storedUser) {
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    loadStoredData();
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token } = response.data;
      const userData: User = { username, role: 'user' }; // Role será implementada posteriormente

      localStorage.setItem('@InventorySystem:token', token);
      localStorage.setItem('@InventorySystem:user', JSON.stringify(userData));

      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(userData);
      showToast('Login realizado com sucesso!', 'success');
    } catch (error) {
      const errorMessage = 
        error instanceof Error ? error.message : 'Erro ao realizar login';
      showToast(errorMessage, 'error');
      throw error;
    }
  }, [showToast]);

  const signOut = useCallback(() => {
    localStorage.removeItem('@InventorySystem:token');
    localStorage.removeItem('@InventorySystem:user');
    setUser(null);
    delete api.defaults.headers.common.Authorization;
    showToast('Logout realizado com sucesso!', 'info');
  }, [showToast]);

  return (
    <AuthContext.Provider 
      value={{ signed: !!user, user, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
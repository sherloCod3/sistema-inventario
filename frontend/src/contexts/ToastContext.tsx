// src/contexts/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextData | undefined>(undefined);

// Hook para usar o toast - IMPORTANTE: Adicionar esta exportação
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    const newToast: Toast = {
      id: uuidv4(),
      message,
      type
    };
    setToasts(current => [...current, newToast]);
    setTimeout(() => removeToast(newToast.id), 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow-lg max-w-sm ${
              toast.type === 'success' ? 'bg-green-500 text-white' :
              toast.type === 'error' ? 'bg-red-500 text-white' :
              toast.type === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            <p className="flex-1 mr-4">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
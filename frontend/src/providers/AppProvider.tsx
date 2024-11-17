import React, { ReactNode } from 'react';
import { InventoryProvider } from '../contexts/InventoryContext';
import { ToastProvider } from '../contexts/ToastContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ToastProvider>
    <InventoryProvider>
    {children}
    </InventoryProvider>
    </ToastProvider>
  );
};

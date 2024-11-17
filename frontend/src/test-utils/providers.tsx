import React from 'react';
import { ToastProvider } from '../contexts/ToastContext';
import { InventoryProvider } from '../contexts/InventoryContext';

export const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      <InventoryProvider>
        {children}
      </InventoryProvider>
    </ToastProvider>
  );
};

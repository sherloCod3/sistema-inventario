// src/contexts/ApiContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

type Environment = 'local' | 'ddns';

interface ApiContextData {
  baseUrl: string;
  environment: Environment;
  toggleEnvironment: () => void;
}

interface ApiProviderProps {
  children: React.ReactNode;
}

const defaultContext: ApiContextData = {
  baseUrl: 'http://localhost:5000/api',
  environment: 'local',
  toggleEnvironment: () => undefined
};

const ApiContext = createContext<ApiContextData>(defaultContext);

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [environment, setEnvironment] = useState<Environment>(
    (localStorage.getItem('@InventorySystem:environment') as Environment) || 'local'
  );

  const baseUrls = {
    local: 'http://localhost:5000/api',
    ddns: 'http://inventoryupa.freeddns.org:5000/api'
  };

  const toggleEnvironment = () => {
    setEnvironment(current => {
      const newEnv = current === 'local' ? 'ddns' : 'local';
      localStorage.setItem('@InventorySystem:environment', newEnv);
      return newEnv;
    });
  };

  useEffect(() => {
    localStorage.setItem('@InventorySystem:apiUrl', baseUrls[environment]);
  }, [environment]);

  const contextValue = {
    baseUrl: baseUrls[environment],
    environment,
    toggleEnvironment
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = (): ApiContextData => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi deve ser usado dentro de um ApiProvider');
  }
  return context;
};
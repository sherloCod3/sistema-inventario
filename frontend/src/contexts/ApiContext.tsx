import React, { createContext, useContext, useState, useEffect } from 'react';

type Environment = 'local' | 'ddns' | 'ngrok';

interface ApiProviderProps {
  children: React.ReactNode;
}

interface ApiContextData {
  baseUrl: string;
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  availableUrls: Record<Environment, string>;
}

const baseUrls: Record<Environment, string> = {
  local: 'http://localhost:5000/api',
  ddns: 'http://inventoryupa.freeddns.org:5000/api',
  ngrok: '' // Será configurado dinamicamente
};

const ApiContext = createContext<ApiContextData>({
  baseUrl: baseUrls.local,
  environment: 'local',
  setEnvironment: () => undefined,
  availableUrls: baseUrls
});

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [environment, setEnvironment] = useState<Environment>(
    (localStorage.getItem('@InventorySystem:environment') as Environment) || 'local'
  );
  const [ngrokUrl, setNgrokUrl] = useState<string>(baseUrls.ngrok);

  // Atualiza as URLs disponíveis incluindo o Ngrok quando configurado
  const availableUrls = {
    ...baseUrls,
    ngrok: ngrokUrl
  };

  // Função para gerenciar a mudança de ambiente
  const handleSetEnvironment = (newEnvironment: Environment) => {
    if (newEnvironment === 'ngrok' && !ngrokUrl) {
      console.warn('URL do Ngrok não configurada. Ambiente local será mantido.');
      return;
    }
    setEnvironment(newEnvironment);
    localStorage.setItem('@InventorySystem:environment', newEnvironment);
  };

  // Efeito para carregar a URL do Ngrok se existir
  useEffect(() => {
    const storedNgrokUrl = localStorage.getItem('@InventorySystem:ngrokUrl');
    if (storedNgrokUrl) {
      setNgrokUrl(storedNgrokUrl);
    }
  }, []);

  const contextValue = {
    baseUrl:
      environment === 'ngrok' && ngrokUrl ? ngrokUrl : availableUrls[environment],
    environment,
    setEnvironment: handleSetEnvironment, // Agora usando a função handleSetEnvironment
    availableUrls
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

export default ApiContext;
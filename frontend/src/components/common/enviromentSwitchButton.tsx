import React from 'react';
import { Globe, Laptop } from 'lucide-react';
import { useApi } from '../../contexts/ApiContext';
import { Button } from '../common/Button';

export const EnvironmentSwitch = () => {
  const { environment, toggleEnvironment } = useApi();

  return (
    <Button
      variant="outline"
      onClick={toggleEnvironment}
      className="flex items-center gap-2"
      title={`Alternar para ${environment === 'local' ? 'DDNS' : 'Local'}`}
    >
      {environment === 'local' ? (
        <>
          <Laptop className="w-4 h-4" />
          <span>Local</span>
        </>
      ) : (
        <>
          <Globe className="w-4 h-4" />
          <span>DDNS</span>
        </>
      )}
    </Button>
  );
};
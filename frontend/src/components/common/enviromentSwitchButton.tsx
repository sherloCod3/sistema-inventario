import React from 'react';
import { Globe, Laptop, Network } from 'lucide-react';
import { useApi } from '../../contexts/ApiContext';
import { Button } from '../common/Button';
import { Select } from '../common/Select';

export const EnvironmentSwitch = () => {
  const { environment, setEnvironment, availableUrls } = useApi();

  const envIcons = {
    local: <Laptop className="w-4 h-4" />,
    ddns: <Globe className="w-4 h-4" />,
    ngrok: <Network className="w-4 h-4" />
  };

  const envLabels = {
    local: 'Local',
    ddns: 'DDNS',
    ngrok: 'Ngrok'
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={environment}
        onChange={(e) => setEnvironment(e.target.value as 'local' | 'ddns' | 'ngrok')}
        className="w-32"
      >
        {Object.entries(envLabels).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </Select>
      
      <div className="text-sm text-gray-500">
        {envIcons[environment]}
        <span className="ml-1">{availableUrls[environment]}</span>
      </div>
    </div>
  );
};
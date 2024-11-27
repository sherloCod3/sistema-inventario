// frontend/src/components/monitoring/ServiceStatus.tsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, Server, Globe, CheckCircle, XCircle } from 'lucide-react';

interface ServiceUrls {
  frontend: string;
  backend: string;
  ddns: string;
}

interface ServiceStatus {
  backend: boolean;
  frontend: boolean;
  ngrok: boolean;
  duckdns: boolean;
}

const ServiceStatusMonitor: React.FC = () => {
  const [status, setStatus] = useState<ServiceStatus>({
    backend: false,
    frontend: false,
    ngrok: false,
    duckdns: false
  });

  const [urls, setUrls] = useState<ServiceUrls>({
    frontend: '',
    backend: '',
    ddns: ''
  });

  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkServices = async () => {
      try {
        // Carrega o arquivo de configuração local
        const response = await fetch('/local-urls.json');
        if (!response.ok) {
          throw new Error('Falha ao carregar configuração');
        }

        const config = await response.json();

        // Atualiza URLs
        setUrls({
          frontend: config.urls.frontend || '',
          backend: config.urls.backend || '',
          ddns: config.urls.ddns || ''
        });

        // Verifica status dos serviços
        const backendHealth = await fetch(`${config.urls.backend}/health`)
          .then(res => res.ok)
          .catch(() => false);

        const frontendHealth = await fetch(config.urls.frontend)
          .then(res => res.ok)
          .catch(() => false);

        setStatus({
          backend: backendHealth,
          frontend: frontendHealth,
          ngrok: !!config.urls.ngrok?.frontend && !!config.urls.ngrok?.backend,
          duckdns: !!config.urls.ddns
        });

        setError('');
      } catch (err) {
        setError('Erro ao verificar status dos serviços');
        console.error('Erro ao verificar serviços:', err);
      }
    };

    // Verifica inicialmente e depois a cada 30 segundos
    checkServices();
    const interval = setInterval(checkServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatusIndicator: React.FC<{ active: boolean }> = ({ active }) => (
    active ?
      <CheckCircle className="w-5 h-5 text-green-500" /> :
      <XCircle className="w-5 h-5 text-red-500" />
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Status dos Serviços</h2>
        <Server className="w-5 h-5 text-gray-500" />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 mb-4">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span>Backend</span>
            <StatusIndicator active={status.backend} />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span>Frontend</span>
            <StatusIndicator active={status.frontend} />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span>Ngrok</span>
            <StatusIndicator active={status.ngrok} />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span>DuckDNS</span>
            <StatusIndicator active={status.duckdns} />
          </div>
        </div>

        {Object.entries(urls).filter(([_, url]) => url).map(([key, url]) => (
          <div key={key} className="flex items-center gap-2 text-sm text-gray-600">
            <Globe className="w-4 h-4" />
            <span className="capitalize">{key}:</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline truncate"
            >
              {url}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceStatusMonitor;
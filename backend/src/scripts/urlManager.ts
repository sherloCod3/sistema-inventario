// src/services/urlManager.ts
import { EventEmitter } from 'events';
import axios, { AxiosError } from 'axios';
import type { NgrokUrls as INgrokUrls, DuckDNSRecord } from '../types/ngrok';

class UrlManager extends EventEmitter {
  private static instance: UrlManager;
  private urls: INgrokUrls = { frontend: null, backend: null };
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly config: {
    timeouts: {
      ngrok: number;
      healthCheck: number;
      monitoring: number;
    };
    retries: {
      maxAttempts: number;
      delay: number;
    };
    ports: {
      frontend: number;
      backend: number;
      ngrok: number;
    };
  };

  private constructor() {
    super();
    this.config = {
      timeouts: {
        ngrok: 30000,
        healthCheck: 5000,
        monitoring: 5 * 60 * 1000 // 5 minutos
      },
      retries: {
        maxAttempts: Number(process.env.RETRIES) || 10,
        delay: Number(process.env.DELAY) || 3000
      },
      ports: {
        frontend: 3000,
        backend: 5000,
        ngrok: 4040
      }
    };
  }

  public static getInstance(): UrlManager {
    if (!UrlManager.instance) {
      UrlManager.instance = new UrlManager();
    }
    return UrlManager.instance;
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts = this.config.retries.maxAttempts
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxAttempts) break;
        
        console.warn(`Tentativa ${attempt}/${maxAttempts} falhou. Tentando novamente...`);
        await new Promise(resolve => setTimeout(resolve, this.config.retries.delay));
      }
    }

    throw lastError || new Error('Operação falhou após todas as tentativas');
  }

  private async validateUrl(url: string, timeout = this.config.timeouts.healthCheck): Promise<boolean> {
    try {
      await axios.get(`${url}/health`, {
        timeout,
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      return true;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Erro ao validar URL ${url}:`, axiosError.message);
      return false;
    }
  }

  public async getActiveNgrokTunnels(): Promise<INgrokUrls> {
    return await this.retryOperation(async () => {
      const { data } = await axios.get(
        `http://localhost:${this.config.ports.ngrok}/api/tunnels`,
        { timeout: this.config.timeouts.ngrok }
      );

      const urls: INgrokUrls = { frontend: null, backend: null };
      
      for (const tunnel of data.tunnels) {
        const addr = tunnel.config?.addr || '';
        if (!tunnel.public_url.startsWith('https://')) {
          throw new Error(`URL do Ngrok não é HTTPS: ${tunnel.public_url}`);
        }

        if (addr.includes(`:${this.config.ports.frontend}`)) {
          urls.frontend = tunnel.public_url;
        } else if (addr.includes(`:${this.config.ports.backend}`)) {
          urls.backend = tunnel.public_url;
        }
      }

      if (!urls.frontend || !urls.backend) {
        throw new Error('Não foi possível encontrar todas as URLs do Ngrok necessárias');
      }

      return urls;
    });
  }

  private async validateUrls(urls: INgrokUrls): Promise<void> {
    const validations = await Promise.all([
      urls.frontend && this.validateUrl(urls.frontend),
      urls.backend && this.validateUrl(urls.backend)
    ]);

    if (!validations.every(isValid => isValid)) {
      throw new Error('Uma ou mais URLs não estão respondendo corretamente');
    }
  }

  private async updateDuckDNS(urls: INgrokUrls): Promise<void> {
    const domain = process.env.DUCKDNS_DOMAIN;
    const token = process.env.DUCKDNS_TOKEN;

    if (!domain || !token) {
      throw new Error('Credenciais DuckDNS não configuradas');
    }

    const record: DuckDNSRecord = {
      frontend: urls.frontend || '',
      backend: urls.backend || '',
      updated_at: new Date().toISOString(),
      version: '1.0'
    };

    const encodedRecord = encodeURIComponent(JSON.stringify(record));
    const updateUrl = `https://www.duckdns.org/update?domains=${domain}&token=${token}&txt=${encodedRecord}`;

    const response = await axios.get(updateUrl);
    if (!response.data.includes('OK')) {
      throw new Error('Falha ao atualizar registro no DuckDNS');
    }

    this.emit('duckdns-updated', record);
  }

  public async startUrlMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    const monitor = async () => {
      try {
        const urls = await this.getActiveNgrokTunnels();
        await this.validateUrls(urls);
        await this.updateDuckDNS(urls);
        
        this.urls = urls;
        this.emit('urls-updated', urls);
      } catch (error) {
        console.error('Erro no monitoramento de URLs:', (error as Error).message);
        this.emit('monitoring-error', error);
      }
    };

    // Executa imediatamente e depois a cada intervalo
    await monitor();
    this.monitoringInterval = setInterval(monitor, this.config.timeouts.monitoring);
  }

  public async stopUrlMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  public getCurrentUrls(): INgrokUrls {
    return { ...this.urls };
  }
}

export default UrlManager;
// src/scripts/ngrokIntegration.ts
import { EventEmitter } from 'events';
import { spawn, ChildProcess, SpawnOptions } from 'child_process';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import UrlManager from './urlManager';
import type { ProcessEvent } from '../types/ngrok';
import axios from 'axios';

// Configurações
const CONFIG = {
  ports: {
    frontend: 3000,
    backend: 5000,
    ngrok: 4040
  },
  timeouts: {
    startup: 10000,
    healthCheck: 5000,
    ngrokCheck: 15000
  },
  paths: {
    frontend: './frontend',
    backend: './backend',
    frontendEnv: './frontend/.env',
    backendEnv: './backend/.env',
    localUrls: './frontend/public/local-urls.json',
    ngrokConfig: './ngrok.yml'
  }
};

// Utilidades de logging
const logger = {
  info: (msg: string) => console.log('\x1b[36m%s\x1b[0m', `ℹ️  ${msg}`),
  success: (msg: string) => console.log('\x1b[32m%s\x1b[0m', `✅ ${msg}`),
  error: (msg: string) => console.log('\x1b[31m%s\x1b[0m', `❌ ${msg}`),
  warning: (msg: string) => console.log('\x1b[33m%s\x1b[0m', `⚠️  ${msg}`),
  debug: (msg: string) => process.env.DEBUG && console.log('\x1b[90m%s\x1b[0m', `🔍 ${msg}`)
};

class NgrokIntegration extends EventEmitter {
  private processes: Record<string, ChildProcess> = {};
  private urlManager: UrlManager;

  constructor() {
    super();
    this.urlManager = UrlManager.getInstance();
  }

  async killProcessOnPort(port: number): Promise<void> {
    const isWin = process.platform === 'win32';
    const command = isWin
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port} -t | xargs kill -9 2>/dev/null || true`;

    try {
      await new Promise((resolve, reject) => {
        const child = spawn(command, [], {
          shell: true,
          stdio: 'pipe'
        });

        child.on('close', (code) => {
          if (code === 0) {
            logger.success(`Porta ${port} liberada`);
            resolve(null);
          } else {
            reject(new Error(`Falha ao liberar porta ${port}`));
          }
        });
      });
    } catch (error) {
      logger.debug(`Nenhum processo encontrado na porta ${port}`);
    }
  }

  private async startProcess(command: string, args: string[], options: {
    cwd?: string;
    name: string;
    env?: NodeJS.ProcessEnv;
  }): Promise<ChildProcess> {
    const spawnOptions: SpawnOptions = {
      cwd: options.cwd || process.cwd(),
      shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
      stdio: 'pipe',
      env: { ...process.env, ...options.env }
    };

    logger.info(`Iniciando ${options.name}...`);
    logger.debug(`Comando: ${command} ${args.join(' ')}`);

    const childProcess = spawn(command, args, spawnOptions);

    childProcess.stdout?.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        logger.debug(`[${options.name}] ${message}`);
      }
    });

    childProcess.stderr?.on('data', (data) => {
      const message = data.toString().trim();
      if (message.toLowerCase().includes('error')) {
        logger.error(`[${options.name}] ${message}`);
      } else {
        logger.debug(`[${options.name}] ${message}`);
      }
    });

    childProcess.on('error', (error) => {
      logger.error(`[${options.name}] Erro no processo: ${error.message}`);
    });

    return childProcess;
  }

  public async startServices(): Promise<void> {
    try {
      // Primeiro, mata processos existentes nas portas
      for (const [service, port] of Object.entries(CONFIG.ports)) {
        await this.killProcessOnPort(port);
      }

      // Aguarda um momento para garantir que as portas foram liberadas
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Inicia o backend
      this.processes.backend = await this.startProcess(
        'npm',
        ['run', 'dev'],
        {
          cwd: resolve(process.cwd(), CONFIG.paths.backend),
          name: 'Backend'
        }
      );

      // Aguarda o backend iniciar
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Inicia o frontend
      this.processes.frontend = await this.startProcess(
        'npm',
        ['start'],
        {
          cwd: resolve(process.cwd(), CONFIG.paths.frontend),
          name: 'Frontend'
        }
      );

      // Aguarda o frontend iniciar
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Inicia o Ngrok verificando se existe arquivo de configuração
      const ngrokConfigPath = resolve(process.cwd(), CONFIG.paths.ngrokConfig);
      const hasNgrokConfig = existsSync(ngrokConfigPath);

      this.processes.ngrok = await this.startProcess(
        'ngrok',
        hasNgrokConfig
          ? ['start', '--config', ngrokConfigPath, '--all', '--log=stdout']
          : ['http', '--log=stdout', `${CONFIG.ports.frontend}`, `${CONFIG.ports.backend}`],
        {
          name: 'Ngrok',
          env: {
            NGROK_CONFIG: ngrokConfigPath
          }
        }
      );

      logger.info('Aguardando serviços iniciarem...');
      await new Promise(resolve => setTimeout(resolve, CONFIG.timeouts.startup));

      // Inicia o monitoramento de URLs
      await this.urlManager.startUrlMonitoring();

      logger.success('Todos os serviços iniciados com sucesso!');
      logger.info('Tentando obter URLs públicas do Ngrok...');
      try {
        const response = await axios.get('http://localhost:4040/api/tunnels', { timeout: 5000 });
        const tunnels = response.data.tunnels;
        logger.info(`URLs do Ngrok obtidas com sucesso: ${JSON.stringify(tunnels)}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Erro ao conectar ao Ngrok: ${errorMessage}`);
        throw new Error('Falha ao obter URLs do Ngrok');
      }
      this.emit('services-started');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Falha ao iniciar serviços: ${errorMessage}`);
      this.emit('startup-error', error);
      throw error;
    }
  }

  public async stopServices(): Promise<void> {
    logger.info('Encerrando serviços...');

    // Para o monitoramento de URLs
    await this.urlManager.stopUrlMonitoring();

    // Encerra todos os processos
    for (const [name, process] of Object.entries(this.processes)) {
      if (process && !process.killed) {
        process.kill('SIGTERM');
        logger.success(`Processo ${name} encerrado`);
      }
    }

    // Limpa as portas novamente
    for (const port of Object.values(CONFIG.ports)) {
      await this.killProcessOnPort(port);
    }

    this.processes = {};
    logger.success('Todos os serviços foram encerrados');
    this.emit('services-stopped');
  }

  public getProcessStatus(): Record<string, boolean> {
    const status = Object.entries(this.processes).reduce((acc, [name, process]) => ({
      ...acc,
      [name]: process && !process.killed
    }), {});

    logger.info('Status dos processos:');
    Object.entries(status).forEach(([name, isRunning]) => {
      if (isRunning) {
        logger.success(`${name}: Rodando`);
      } else {
        logger.error(`${name}: Parado`);
      }
    });

    return status;
  }
}

export default NgrokIntegration;
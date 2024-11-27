import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../config/logger';

interface ServiceConfig {
  ports: {
    frontend: number;
    backend: number;
    ngrok: number;
  };
  timeouts: {
    startup: number;
    healthCheck: number;
  };
  urls: {
    ngrokStatic?: string;
  };
}

export class StartupService extends EventEmitter {
  private processes: Record<string, ChildProcess> = {};
  private config: ServiceConfig;

  constructor() {
    super();
    this.config = {
      ports: {
        frontend: Number(process.env.FRONTEND_PORT) || 3000,
        backend: Number(process.env.BACKEND_PORT) || 5000,
        ngrok: 4040
      },
      timeouts: {
        startup: 10000,
        healthCheck: 5000
      },
      urls: {
        ngrokStatic: process.env.NGROK_STATIC_URL
      }
    };
  }

  public async start(): Promise<void> {
    try {
      await this.clearPorts();
      await this.startBackend();
      await this.startFrontend();
      await this.configureNgrok();
      this.displayUrls();
    } catch (error) {
      logger.error('❌ Startup failed:', error);
      await this.cleanup();
      throw error;
    }
  }

  private async clearPorts(): Promise<void> {
    const platform = process.platform;
    const ports = Object.values(this.config.ports);
    
    for (const port of ports) {
      try {
        const command = platform === 'win32'
          ? `netstat -ano | findstr :${port}`
          : `lsof -ti:${port} | xargs kill -9`;
          
        await this.executeCommand(command);
        logger.info(`✅ Port ${port} cleared`);
      } catch {
        // Port already free
      }
    }
  }

  private async startBackend(): Promise<void> {
    logger.info('🚀 Starting backend...');
    const backendPath = path.resolve(process.cwd());
    
    this.processes.backend = spawn('npm', ['run', 'dev'], {
      cwd: backendPath,
      shell: true,
      env: { ...process.env, PORT: String(this.config.ports.backend) }
    });

    this.processes.backend.stdout?.on('data', (data) => {
      logger.info(`Backend: ${data.toString().trim()}`);
    });

    this.processes.backend.stderr?.on('data', (data) => {
      logger.error(`Backend Error: ${data.toString().trim()}`);
    });

    await this.waitForService(
      `http://localhost:${this.config.ports.backend}/health`,
      'Backend'
    );
  }

  private async startFrontend(): Promise<void> {
    try {
      logger.info('🚀 Starting frontend...');
      const frontendPath = path.resolve(process.cwd(), '../frontend');
      
      const stats = await fs.stat(frontendPath);
      if (!stats.isDirectory()) {
        throw new Error(`Frontend path is not a directory: ${frontendPath}`);
      }
      logger.info(`Frontend directory found at: ${frontendPath}`);

      const packageJsonPath = path.join(frontendPath, 'package.json');
      await fs.access(packageJsonPath);
      logger.info('Frontend package.json found');

      logger.info('Installing frontend dependencies...');
      await new Promise<void>((resolve, reject) => {
        const install = spawn('npm', ['install'], {
          cwd: frontendPath,
          shell: true
        });

        install.on('close', (code) => {
          if (code === 0) {
            logger.info('Frontend dependencies installed successfully');
            resolve();
          } else {
            reject(new Error(`npm install failed with code ${code}`));
          }
        });
      });

      this.processes.frontend = spawn('npm', ['start'], {
        cwd: frontendPath,
        shell: true,
        env: { 
          ...process.env, 
          PORT: String(this.config.ports.frontend),
          BROWSER: 'none'
        }
      });

      this.processes.frontend.stdout?.on('data', (data) => {
        logger.info(`Frontend: ${data.toString().trim()}`);
      });

      this.processes.frontend.stderr?.on('data', (data) => {
        logger.error(`Frontend Error: ${data.toString().trim()}`);
      });

      await this.waitForService(
        `http://localhost:${this.config.ports.frontend}`,
        'Frontend'
      );

      logger.info('✅ Frontend started successfully');
    } catch (error) {
      logger.error('❌ Failed to start frontend:', error);
      throw error;
    }
  }

  private async configureNgrok(): Promise<void> {
    try {
      logger.info('🔧 Configuring Ngrok...');
      
      const staticUrl = this.config.urls.ngrokStatic;
      if (!staticUrl) {
        logger.info('ℹ️ No static Ngrok URL configured, starting dynamic tunnel...');
        await this.startDynamicNgrok();
      } else {
        logger.info(`✅ Using static Ngrok URL: ${staticUrl}`);
      }
    } catch (error) {
      logger.error('❌ Failed to configure Ngrok:', error);
      throw error;
    }
  }

  private async startDynamicNgrok(): Promise<void> {
    const ngrokPath = await this.getExecutablePath('ngrok');
    const configPath = path.resolve(process.cwd(), 'ngrok.yml');

    this.processes.ngrok = spawn(ngrokPath, ['start', '--config', configPath, '--all'], {
      shell: true,
      env: { ...process.env, NGROK_CONFIG: configPath }
    });

    await this.waitForService(
      `http://localhost:${this.config.ports.ngrok}/api/tunnels`,
      'Ngrok'
    );
  }

  private async waitForService(url: string, name: string, retries = 60): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await axios.get(url, { timeout: this.config.timeouts.healthCheck });
        logger.info(`✅ ${name} is ready`);
        return;
      } catch {
        if (i === retries - 1) {
          throw new Error(`Timeout waiting for ${name}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  private async getExecutablePath(cmd: string): Promise<string> {
    const { stdout } = await this.executeCommand(`which ${cmd}`);
    return stdout.trim();
  }

  private async executeCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      require('child_process').exec(command, (error: Error | null, stdout: string, stderr: string) => {
        if (error) reject(error);
        else resolve({ stdout, stderr });
      });
    });
  }

  private displayUrls(): void {
    const staticUrl = this.config.urls.ngrokStatic;
    
    logger.info('\n🌐 System URLs:');
    logger.info(`📡 Local Frontend: http://localhost:${this.config.ports.frontend}`);
    logger.info(`📡 Local Backend: http://localhost:${this.config.ports.backend}`);
    
    if (staticUrl) {
      logger.info(`🌍 Remote URL: ${staticUrl}`);
    }
  }

  private async cleanup(): Promise<void> {
    for (const [name, process] of Object.entries(this.processes)) {
      if (process && !process.killed) {
        process.kill();
        logger.info(`✅ ${name} process terminated`);
      }
    }
    await this.clearPorts();
  }
}
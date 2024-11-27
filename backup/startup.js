// startup.js
const { exec, spawn } = require('child_process');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
const util = require('util');
const execAsync = util.promisify(exec);

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
    localUrls: './frontend/public/local-urls.json'
  },
  urls: {
    ddns: 'http://upalpinventorysystem.duckdns.org'
  }
};

// Utilidades de logging
const logger = {
  info: (msg) => console.log('\x1b[36m%s\x1b[0m', `ℹ️ ${msg}`),
  success: (msg) => console.log('\x1b[32m%s\x1b[0m', `✅ ${msg}`),
  error: (msg) => console.log('\x1b[31m%s\x1b[0m', `❌ ${msg}`),
  warning: (msg) => console.log('\x1b[33m%s\x1b[0m', `⚠️ ${msg}`),
  debug: (msg) => process.env.DEBUG && console.log('\x1b[90m%s\x1b[0m', `🔍 ${msg}`)
};

// Classe principal de gerenciamento do startup
class StartupManager {
  constructor() {
    this.processes = {};
    this.urls = {
      frontend: null,
      backend: null,
      ngrok: null
    };
  }

  async initialize() {
    try {
      await this.validateEnvironment();
      await this.checkPorts();
      await this.startServices();
      await this.configureNgrok();
      await this.updateDuckDNS();
      await this.verifyConnectivity();
      await this.saveConfiguration();
      
      logger.success('Sistema inicializado com sucesso!');
      this.displayUrls();
    } catch (error) {
      logger.error(`Erro na inicialização: ${error.message}`);
      await this.cleanup();
      process.exit(1);
    }
  }

  async validateEnvironment() {
    logger.info('Validando ambiente...');
    
    // Verifica dependências necessárias
    const dependencies = ['node', 'npm', 'ngrok'];
    for (const dep of dependencies) {
      try {
        await execAsync(`which ${dep}`);
      } catch {
        throw new Error(`Dependência não encontrada: ${dep}`);
      }
    }

    // Verifica arquivos de configuração
    const requiredFiles = [
      CONFIG.paths.frontendEnv,
      CONFIG.paths.backendEnv
    ];

    for (const file of requiredFiles) {
      try {
        await fs.access(file);
      } catch {
        throw new Error(`Arquivo não encontrado: ${file}`);
      }
    }

    logger.success('Ambiente validado');
  }

  async checkPorts() {
    logger.info('Verificando portas...');

    for (const [service, port] of Object.entries(CONFIG.ports)) {
      try {
        await this.killProcessOnPort(port);
        logger.success(`Porta ${port} liberada para ${service}`);
      } catch (error) {
        throw new Error(`Não foi possível liberar a porta ${port}: ${error.message}`);
      }
    }
  }

  async killProcessOnPort(port) {
    const isWin = process.platform === 'win32';
    
    try {
      if (isWin) {
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        const pid = stdout.split(/\s+/)[4];
        if (pid) await execAsync(`taskkill /F /PID ${pid}`);
      } else {
        await execAsync(`lsof -i :${port} -t | xargs kill -9`);
      }
    } catch (error) {
      logger.debug(`Nenhum processo encontrado na porta ${port}`);
    }
  }

  async startServices() {
    logger.info('Iniciando serviços...');

    // Inicia o backend
    this.processes.backend = spawn('npm', ['run', 'dev'], {
      cwd: CONFIG.paths.backend,
      shell: true
    });

    // Inicia o frontend
    this.processes.frontend = spawn('npm', ['start'], {
      cwd: CONFIG.paths.frontend,
      shell: true
    });

    // Inicia o Ngrok
    this.processes.ngrok = spawn('ngrok', ['start', '--all'], {
      shell: true
    });

    // Configura handlers de log e erro
    for (const [service, process] of Object.entries(this.processes)) {
      process.stdout.on('data', (data) => logger.debug(`[${service}] ${data}`));
      process.stderr.on('data', (data) => logger.debug(`[${service}] ERR: ${data}`));
    }

    // Aguarda serviços inicializarem
    await new Promise(resolve => setTimeout(resolve, CONFIG.timeouts.startup));
  }

  async configureNgrok() {
    logger.info('Configurando Ngrok...');

    try {
      const response = await axios.get('http://localhost:4040/api/tunnels');
      const tunnels = response.data.tunnels;

      this.urls.ngrok = {
        frontend: tunnels.find(t => t.config.addr.includes(':3000'))?.public_url,
        backend: tunnels.find(t => t.config.addr.includes(':5000'))?.public_url
      };

      if (!this.urls.ngrok.frontend || !this.urls.ngrok.backend) {
        throw new Error('Túneis Ngrok não encontrados');
      }

      logger.success('Ngrok configurado com sucesso');
    } catch (error) {
      throw new Error(`Erro na configuração do Ngrok: ${error.message}`);
    }
  }

  async updateDuckDNS() {
    if (!process.env.DUCKDNS_TOKEN || !process.env.DUCKDNS_DOMAIN) {
      logger.warning('Credenciais DuckDNS não encontradas, pulando atualização');
      return;
    }

    try {
      const urls = {
        frontend: this.urls.ngrok.frontend,
        backend: this.urls.ngrok.backend,
        ddns: CONFIG.urls.ddns
      };

      const response = await axios.get(
        `https://www.duckdns.org/update?domains=${process.env.DUCKDNS_DOMAIN}` +
        `&token=${process.env.DUCKDNS_TOKEN}` +
        `&txt=${encodeURIComponent(JSON.stringify(urls))}`
      );

      if (!response.data.includes('OK')) {
        throw new Error('Resposta inválida do DuckDNS');
      }

      logger.success('DuckDNS atualizado');
    } catch (error) {
      logger.error(`Erro ao atualizar DuckDNS: ${error.message}`);
    }
  }

  async verifyConnectivity() {
    logger.info('Verificando conectividade...');

    const endpoints = {
      frontend: `${this.urls.ngrok.frontend}/health`,
      backend: `${this.urls.ngrok.backend}/health`,
      ddns: `${CONFIG.urls.ddns}/health`
    };

    for (const [service, url] of Object.entries(endpoints)) {
      try {
        const response = await axios.get(url, {
          timeout: CONFIG.timeouts.healthCheck,
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });

        if (response.status === 200) {
          logger.success(`${service} está online`);
        } else {
          logger.warning(`${service} retornou status ${response.status}`);
        }
      } catch (error) {
        logger.error(`${service} não está acessível: ${error.message}`);
      }
    }
  }

  async saveConfiguration() {
    const config = {
      timestamp: new Date().toISOString(),
      urls: {
        ...this.urls,
        ddns: CONFIG.urls.ddns
      }
    };

    try {
      await fs.writeFile(
        CONFIG.paths.localUrls,
        JSON.stringify(config, null, 2)
      );
      logger.success('Configuração salva em local-urls.json');
    } catch (error) {
      logger.error(`Erro ao salvar configuração: ${error.message}`);
    }
  }

  displayUrls() {
    logger.info('\nURLs disponíveis:');
    console.log('\nLocal:');
    console.log(`  Frontend: http://localhost:${CONFIG.ports.frontend}`);
    console.log(`  Backend: http://localhost:${CONFIG.ports.backend}`);
    
    console.log('\nNgrok:');
    console.log(`  Frontend: ${this.urls.ngrok.frontend}`);
    console.log(`  Backend: ${this.urls.ngrok.backend}`);
    
    console.log('\nDDNS:');
    console.log(`  URL: ${CONFIG.urls.ddns}`);
  }

  async cleanup() {
    logger.info('Realizando limpeza...');

    for (const [service, process] of Object.entries(this.processes)) {
      if (process && !process.killed) {
        process.kill();
        logger.debug(`Processo ${service} encerrado`);
      }
    }

    for (const [service, port] of Object.entries(CONFIG.ports)) {
      await this.killProcessOnPort(port);
    }

    logger.success('Limpeza concluída');
  }
}

// Handler de encerramento
process.on('SIGINT', async () => {
  logger.info('\nEncerrando serviços...');
  const manager = new StartupManager();
  await manager.cleanup();
  process.exit(0);
});

// Executa o script
const manager = new StartupManager();
manager.initialize().catch(error => {
  logger.error(`Erro fatal: ${error.message}`);
  process.exit(1);
});
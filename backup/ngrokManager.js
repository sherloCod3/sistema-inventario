const { spawn, exec } = require('child_process');
const axios = require('axios');
const util = require('util');
const execAsync = util.promisify(exec);

const config = {
  retryAttempts: 3,
  retryDelay: 2000,
  healthcheckTimeout: 5000,
  ports: {
    frontend: 3000,
    backend: 5000,
    ngrok: 4040
  }
};

const log = {
  info: (msg) => console.log('\x1b[34mℹ️', msg, '\x1b[0m'),
  success: (msg) => console.log('\x1b[32m✅', msg, '\x1b[0m'),
  error: (msg) => console.log('\x1b[31m❌', msg, '\x1b[0m'),
  warning: (msg) => console.log('\x1b[33m⚠️', msg, '\x1b[0m'),
  debug: (msg) => process.env.DEBUG && console.log('\x1b[90m🔍', msg, '\x1b[0m')
};


async function healthcheck(url, timeout = config.healthcheckTimeout) {
  try {
    await axios.get(url, { 
      timeout,
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    return true;
  } catch {
    return false;
  }
}

async function retryOperation(operation, attempts = config.retryAttempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === attempts - 1) throw error;
      log.warning(`Tentativa ${i + 1}/${attempts} falhou. Tentando novamente...`);
      await new Promise(resolve => setTimeout(resolve, config.retryDelay));
    }
  }
}


async function killProcessOnPort(port) {
  try {
    const platform = process.platform;
    if (platform === 'win32') {
      await execAsync(`netstat -ano | findstr :${port}`);
    } else {
      await execAsync(`lsof -i :${port} -t | xargs kill -9`);
    }
    log.success(`Porto ${port} liberado`);
  } catch {
    log.debug(`Nenhum processo encontrado na porta ${port}`);
  }
}

async function getActiveNgrokTunnels() {
  const { data } = await axios.get('http://localhost:4040/api/tunnels');
  
  const urls = {
    frontend: null,
    backend: null
  };

  data.tunnels.forEach(tunnel => {
    const addr = tunnel.config?.addr || '';
    if (addr.includes(':3000')) urls.frontend = tunnel.public_url;
    if (addr.includes(':5000')) urls.backend = tunnel.public_url;
  });

  return urls;
}


async function updateDuckDNS(urls) {
  if (!process.env.DUCKDNS_DOMAIN || !process.env.DUCKDNS_TOKEN) {
    throw new Error('Credenciais DuckDNS não configuradas');
  }

  const response = await axios.get(
    `https://www.duckdns.org/update?domains=${process.env.DUCKDNS_DOMAIN}&token=${process.env.DUCKDNS_TOKEN}&txt=${encodeURIComponent(JSON.stringify(urls))}`
  );

  if (!response.data.includes('OK')) {
    throw new Error('Falha ao atualizar DuckDNS');
  }
}

async function validateUrls(urls) {
  const results = await Promise.all([
    healthcheck(urls.frontend),
    healthcheck(urls.backend)
  ]);

  if (!results.every(result => result)) {
    throw new Error('Nem todas as URLs estão respondendo');
  }
}


function runProcess(command, args, options) {
  const process = spawn(command, args, {
    ...options,
    shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
    stdio: 'pipe'
  });

  process.stdout.on('data', data => log.debug(`[${options.name}] ${data}`));
  process.stderr.on('data', data => log.debug(`[${options.name}] ERR: ${data}`));
  
  return process;
}


async function startServices() {
  try {
    log.info('Iniciando serviços...');

    // Libera as portas
    for (const [service, port] of Object.entries(config.ports)) {
      await killProcessOnPort(port);
    }

    // Inicia os serviços
    const processes = {
      backend: runProcess('npm', ['run', 'dev'], { 
        cwd: './backend',
        name: 'Backend'
      }),
      frontend: runProcess('npm', ['start'], {
        cwd: './frontend',
        name: 'Frontend'
      }),
      ngrok: runProcess('ngrok', ['start', '--all'], {
        name: 'Ngrok'
      })
    };

    // Aguarda Ngrok inicializar
    log.info('Aguardando Ngrok inicializar...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Obtém e valida URLs
    const urls = await retryOperation(async () => {
      const tunnels = await getActiveNgrokTunnels();
      if (!tunnels.frontend || !tunnels.backend) {
        throw new Error('URLs do Ngrok não encontradas');
      }
      return tunnels;
    });

    // Valida conexões
    log.info('Validando conexões...');
    await validateUrls(urls);

    // Atualiza DuckDNS
    log.info('Atualizando DuckDNS...');
    await updateDuckDNS(urls);

    // Exibe URLs
    log.success('Serviços iniciados com sucesso!');
    log.info('Frontend URL: ' + urls.frontend);
    log.info('Backend URL: ' + urls.backend);

    // Testa conexões finais
    log.info('Testando conexões finais...');
    const frontendTest = await execAsync(`curl -s -o /dev/null -w "%{http_code}" ${urls.frontend}`);
    const backendTest = await execAsync(`curl -s -o /dev/null -w "%{http_code}" ${urls.backend}/health`);
    
    log.success(`Frontend Status: ${frontendTest.stdout}`);
    log.success(`Backend Status: ${backendTest.stdout}`);

    return { processes, urls };
  } catch (error) {
    log.error('Erro ao iniciar serviços:');
    log.error(error.message);
    throw error;
  }
}

// Tratamento de encerramento
process.on('SIGINT', async () => {
  log.info('Encerrando serviços...');
  
  for (const [service, port] of Object.entries(config.ports)) {
    await killProcessOnPort(port);
  }
  
  log.success('Serviços encerrados');
  process.exit(0);
});

// Auto inicialização
if (require.main === module) {
  startServices().catch(() => process.exit(1));
}

module.exports = {
  startServices,
  healthcheck,
  getActiveNgrokTunnels,
  updateDuckDNS
};

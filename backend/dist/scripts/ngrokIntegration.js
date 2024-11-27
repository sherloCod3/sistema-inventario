"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scripts/ngrokIntegration.ts
const events_1 = require("events");
const child_process_1 = require("child_process");
const path_1 = require("path");
const fs_1 = require("fs");
const urlManager_1 = __importDefault(require("./urlManager"));
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
    info: (msg) => console.log('\x1b[36m%s\x1b[0m', `ℹ️  ${msg}`),
    success: (msg) => console.log('\x1b[32m%s\x1b[0m', `✅ ${msg}`),
    error: (msg) => console.log('\x1b[31m%s\x1b[0m', `❌ ${msg}`),
    warning: (msg) => console.log('\x1b[33m%s\x1b[0m', `⚠️  ${msg}`),
    debug: (msg) => process.env.DEBUG && console.log('\x1b[90m%s\x1b[0m', `🔍 ${msg}`)
};
class NgrokIntegration extends events_1.EventEmitter {
    constructor() {
        super();
        this.processes = {};
        this.urlManager = urlManager_1.default.getInstance();
    }
    async killProcessOnPort(port) {
        const isWin = process.platform === 'win32';
        const command = isWin
            ? `netstat -ano | findstr :${port}`
            : `lsof -i :${port} -t | xargs kill -9 2>/dev/null || true`;
        try {
            await new Promise((resolve, reject) => {
                const child = (0, child_process_1.spawn)(command, [], {
                    shell: true,
                    stdio: 'pipe'
                });
                child.on('close', (code) => {
                    if (code === 0) {
                        logger.success(`Porta ${port} liberada`);
                        resolve(null);
                    }
                    else {
                        reject(new Error(`Falha ao liberar porta ${port}`));
                    }
                });
            });
        }
        catch (error) {
            logger.debug(`Nenhum processo encontrado na porta ${port}`);
        }
    }
    async startProcess(command, args, options) {
        var _a, _b;
        const spawnOptions = {
            cwd: options.cwd || process.cwd(),
            shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
            stdio: 'pipe',
            env: { ...process.env, ...options.env }
        };
        logger.info(`Iniciando ${options.name}...`);
        logger.debug(`Comando: ${command} ${args.join(' ')}`);
        const childProcess = (0, child_process_1.spawn)(command, args, spawnOptions);
        (_a = childProcess.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
            const message = data.toString().trim();
            if (message) {
                logger.debug(`[${options.name}] ${message}`);
            }
        });
        (_b = childProcess.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
            const message = data.toString().trim();
            if (message.toLowerCase().includes('error')) {
                logger.error(`[${options.name}] ${message}`);
            }
            else {
                logger.debug(`[${options.name}] ${message}`);
            }
        });
        childProcess.on('error', (error) => {
            logger.error(`[${options.name}] Erro no processo: ${error.message}`);
        });
        return childProcess;
    }
    async startServices() {
        try {
            // Primeiro, mata processos existentes nas portas
            for (const [service, port] of Object.entries(CONFIG.ports)) {
                await this.killProcessOnPort(port);
            }
            // Aguarda um momento para garantir que as portas foram liberadas
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Inicia o backend
            this.processes.backend = await this.startProcess('npm', ['run', 'dev'], {
                cwd: (0, path_1.resolve)(process.cwd(), CONFIG.paths.backend),
                name: 'Backend'
            });
            // Aguarda o backend iniciar
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Inicia o frontend
            this.processes.frontend = await this.startProcess('npm', ['start'], {
                cwd: (0, path_1.resolve)(process.cwd(), CONFIG.paths.frontend),
                name: 'Frontend'
            });
            // Aguarda o frontend iniciar
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Inicia o Ngrok verificando se existe arquivo de configuração
            const ngrokConfigPath = (0, path_1.resolve)(process.cwd(), CONFIG.paths.ngrokConfig);
            const hasNgrokConfig = (0, fs_1.existsSync)(ngrokConfigPath);
            this.processes.ngrok = await this.startProcess('ngrok', hasNgrokConfig
                ? ['start', '--config', ngrokConfigPath, '--all', '--log=stdout']
                : ['http', '--log=stdout', `${CONFIG.ports.frontend}`, `${CONFIG.ports.backend}`], {
                name: 'Ngrok',
                env: {
                    NGROK_CONFIG: ngrokConfigPath
                }
            });
            logger.info('Aguardando serviços iniciarem...');
            await new Promise(resolve => setTimeout(resolve, CONFIG.timeouts.startup));
            // Inicia o monitoramento de URLs
            await this.urlManager.startUrlMonitoring();
            logger.success('Todos os serviços iniciados com sucesso!');
            this.emit('services-started');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Falha ao iniciar serviços: ${errorMessage}`);
            this.emit('startup-error', error);
            throw error;
        }
    }
    async stopServices() {
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
    getProcessStatus() {
        const status = Object.entries(this.processes).reduce((acc, [name, process]) => ({
            ...acc,
            [name]: process && !process.killed
        }), {});
        logger.info('Status dos processos:');
        Object.entries(status).forEach(([name, isRunning]) => {
            if (isRunning) {
                logger.success(`${name}: Rodando`);
            }
            else {
                logger.error(`${name}: Parado`);
            }
        });
        return status;
    }
}
exports.default = NgrokIntegration;
//# sourceMappingURL=ngrokIntegration.js.map
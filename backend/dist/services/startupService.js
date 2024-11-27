"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartupService = void 0;
const events_1 = require("events");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../config/logger");
const duckDNSService_1 = require("./duckDNSService");
const cron_1 = require("cron");
const systemCheck_1 = require("../utils/systemCheck");
const envCheck_1 = require("../utils/envCheck");
class StartupService extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.backendProcess = null;
        this.frontendProcess = null;
        this.ngrokProcess = null;
        this.ngrokUrls = { frontend: null, backend: null };
        this.duckDNSUpdateJob = null;
        this.retries = config.retries || { maxAttempts: 3, delay: 2000 };
        this.config.ports = { frontend: 3000, backend: 5000, ngrok: 4000 };
    }
    async start() {
        try {
            (0, envCheck_1.checkRequiredEnvVars)();
            await this.clearPorts();
            await this.startBackend();
            await this.startFrontend();
            if (!(await this.checkNgrokRunning())) {
                await this.startNgrok();
            }
            await this.retryOperation(() => this.configureNgrokAndDuckDNS());
            await this.retryOperation(() => {
                if (this.ngrokUrls.backend) {
                    return (0, systemCheck_1.checkSystemAvailability)(this.ngrokUrls.backend);
                }
                throw new Error('Backend URL not available for system check');
            });
            this.startPeriodicDuckDNSUpdate();
            this.displayUrls();
        }
        catch (error) {
            logger_1.logger.error('❌ Falha na inicialização:', error);
            await this.cleanup();
            throw error;
        }
    }
    async clearPorts() {
        for (const [service, port] of Object.entries(this.config.ports)) {
            try {
                await this.executeCommand(`lsof -ti:${port} | xargs kill -9`);
                logger_1.logger.info(`✅ Porta ${port} liberada para ${service}`);
            }
            catch (_a) {
                // Ignora se a porta já estiver livre
            }
        }
    }
    async startBackend() {
        var _a, _b;
        logger_1.logger.info('🚀 Iniciando o backend...');
        const backendPath = path_1.default.resolve(process.cwd(), '../backend');
        this.backendProcess = (0, child_process_1.spawn)('npm', ['run', 'dev'], { cwd: backendPath, shell: true });
        (_a = this.backendProcess.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
            logger_1.logger.info(`Backend: ${data.toString().trim()}`);
        });
        (_b = this.backendProcess.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
            logger_1.logger.error(`Backend Error: ${data.toString().trim()}`);
        });
        // Aumentar o tempo de espera para 2 minutos (120000 ms)
        await this.waitForService('http://localhost:5000/health', 'Backend', 60, 2000);
    }
    async startFrontend() {
        var _a, _b;
        logger_1.logger.info('🚀 Iniciando o frontend...');
        const frontendPath = path_1.default.resolve(process.cwd(), '../frontend');
        this.frontendProcess = (0, child_process_1.spawn)('npm', ['start'], { cwd: frontendPath, shell: true });
        (_a = this.frontendProcess.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
            logger_1.logger.info(`Frontend: ${data.toString().trim()}`);
        });
        (_b = this.frontendProcess.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
            logger_1.logger.error(`Frontend Error: ${data.toString().trim()}`);
        });
        // Aumentar o tempo de espera para 2 minutos (120000 ms)
        await this.waitForService('http://localhost:3000', 'Frontend', 60, 2000);
    }
    async waitForService(url, serviceName, maxRetries = 60, retryInterval = 2000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                await axios_1.default.get(url);
                logger_1.logger.info(`✅ ${serviceName} está pronto`);
                return;
            }
            catch (error) {
                logger_1.logger.debug(`Aguardando ${serviceName} iniciar... (tentativa ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryInterval));
            }
        }
        throw new Error(`Timeout ao aguardar ${serviceName} iniciar`);
    }
    async checkNgrokRunning() {
        try {
            await axios_1.default.get(`http://localhost:${this.config.ports.ngrok}`);
            return true;
        }
        catch (error) {
            logger_1.logger.warn('⚠️ Ngrok não parece estar em execução');
            return false;
        }
    }
    async startNgrok() {
        var _a, _b;
        logger_1.logger.info('🚀 Iniciando Ngrok...');
        const ngrokPath = await this.getExecutablePath('ngrok');
        const configPath = path_1.default.resolve(process.cwd(), 'ngrok.yml');
        this.ngrokProcess = (0, child_process_1.spawn)(ngrokPath, ['start', '--config', configPath, '--all'], {
            detached: true,
            stdio: 'pipe'
        });
        (_a = this.ngrokProcess.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
            logger_1.logger.info(`📡 Ngrok: ${data.toString().trim()}`);
        });
        (_b = this.ngrokProcess.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
            logger_1.logger.error(`❌ Ngrok Error: ${data.toString().trim()}`);
        });
        // Aguardar o Ngrok iniciar
        await this.waitForService(`http://localhost:${this.config.ports.ngrok}`, 'Ngrok');
    }
    async configureNgrokAndDuckDNS() {
        await this.configureNgrok();
        await this.updateDuckDNS();
    }
    async configureNgrok() {
        var _a, _b;
        logger_1.logger.info('🔧 Configurando Ngrok...');
        const { data } = await axios_1.default.get(`http://localhost:${this.config.ports.ngrok}/api/tunnels`);
        if (!data.tunnels || data.tunnels.length === 0) {
            throw new Error('Nenhum túnel Ngrok encontrado');
        }
        const tunnels = data.tunnels;
        this.ngrokUrls.frontend = ((_a = tunnels.find((t) => { var _a, _b; return (_b = (_a = t.config) === null || _a === void 0 ? void 0 : _a.addr) === null || _b === void 0 ? void 0 : _b.includes(`:${this.config.ports.frontend}`); })) === null || _a === void 0 ? void 0 : _a.public_url) || null;
        this.ngrokUrls.backend = ((_b = tunnels.find((t) => { var _a, _b; return (_b = (_a = t.config) === null || _a === void 0 ? void 0 : _a.addr) === null || _b === void 0 ? void 0 : _b.includes(`:${this.config.ports.backend}`); })) === null || _b === void 0 ? void 0 : _b.public_url) || null;
        if (!this.ngrokUrls.frontend || !this.ngrokUrls.backend) {
            throw new Error('URLs do Ngrok não encontradas para frontend ou backend');
        }
        logger_1.logger.info('✅ URLs Ngrok configuradas:', this.ngrokUrls);
    }
    async updateDuckDNS() {
        if (!process.env.DUCKDNS_DOMAIN || !process.env.DUCKDNS_TOKEN) {
            logger_1.logger.warn('⚠️ Credenciais DuckDNS não encontradas');
            return;
        }
        try {
            await (0, duckDNSService_1.updateDuckDNS)(this.ngrokUrls.backend || '');
            logger_1.logger.info('✅ DuckDNS atualizado com sucesso');
        }
        catch (error) {
            logger_1.logger.error('❌ Falha ao atualizar DuckDNS:', error);
            throw error;
        }
    }
    startPeriodicDuckDNSUpdate() {
        this.duckDNSUpdateJob = new cron_1.CronJob('*/5 * * * *', async () => {
            try {
                await this.updateDuckDNS();
            }
            catch (error) {
                logger_1.logger.error('❌ Falha na atualização periódica do DuckDNS:', error);
            }
        });
        this.duckDNSUpdateJob.start();
        logger_1.logger.info('✅ Atualização periódica do DuckDNS configurada');
    }
    displayUrls() {
        logger_1.logger.info('🌐 URLs do sistema:');
        logger_1.logger.info(`Frontend: ${this.ngrokUrls.frontend}`);
        logger_1.logger.info(`Backend: ${this.ngrokUrls.backend}`);
    }
    async getExecutablePath(cmd) {
        try {
            const { stdout } = await this.executeCommand(`which ${cmd}`);
            return stdout.trim();
        }
        catch (error) {
            throw new Error(`Executável ${cmd} não encontrado no PATH`);
        }
    }
    async executeCommand(command) {
        return new Promise((resolve, reject) => {
            require('child_process').exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve({ stdout, stderr });
                }
            });
        });
    }
    async retryOperation(operation, maxRetries = 3, delay = 2000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            }
            catch (error) {
                if (i === maxRetries - 1)
                    throw error;
                logger_1.logger.warn(`Operação falhou, tentando novamente em ${delay / 1000} segundos...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error('Operação falhou após todas as tentativas');
    }
    async cleanup() {
        if (this.duckDNSUpdateJob) {
            this.duckDNSUpdateJob.stop();
        }
        if (this.backendProcess) {
            this.backendProcess.kill();
        }
        if (this.frontendProcess) {
            this.frontendProcess.kill();
        }
        if (this.ngrokProcess) {
            this.ngrokProcess.kill();
        }
        await this.clearPorts();
    }
}
exports.StartupService = StartupService;
exports.default = StartupService;
//# sourceMappingURL=startupService.js.map
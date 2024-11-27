"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/services/urlManager.ts
const events_1 = require("events");
const axios_1 = __importDefault(require("axios"));
class UrlManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.urls = { frontend: null, backend: null };
        this.monitoringInterval = null;
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
    static getInstance() {
        if (!UrlManager.instance) {
            UrlManager.instance = new UrlManager();
        }
        return UrlManager.instance;
    }
    async retryOperation(operation, maxAttempts = this.config.retries.maxAttempts) {
        let lastError = null;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (attempt === maxAttempts)
                    break;
                console.warn(`Tentativa ${attempt}/${maxAttempts} falhou. Tentando novamente...`);
                await new Promise(resolve => setTimeout(resolve, this.config.retries.delay));
            }
        }
        throw lastError || new Error('Operação falhou após todas as tentativas');
    }
    async validateUrl(url, timeout = this.config.timeouts.healthCheck) {
        try {
            await axios_1.default.get(`${url}/health`, {
                timeout,
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            return true;
        }
        catch (error) {
            const axiosError = error;
            console.error(`Erro ao validar URL ${url}:`, axiosError.message);
            return false;
        }
    }
    async getActiveNgrokTunnels() {
        return await this.retryOperation(async () => {
            var _a;
            const { data } = await axios_1.default.get(`http://localhost:${this.config.ports.ngrok}/api/tunnels`, { timeout: this.config.timeouts.ngrok });
            const urls = { frontend: null, backend: null };
            for (const tunnel of data.tunnels) {
                const addr = ((_a = tunnel.config) === null || _a === void 0 ? void 0 : _a.addr) || '';
                if (!tunnel.public_url.startsWith('https://')) {
                    throw new Error(`URL do Ngrok não é HTTPS: ${tunnel.public_url}`);
                }
                if (addr.includes(`:${this.config.ports.frontend}`)) {
                    urls.frontend = tunnel.public_url;
                }
                else if (addr.includes(`:${this.config.ports.backend}`)) {
                    urls.backend = tunnel.public_url;
                }
            }
            if (!urls.frontend || !urls.backend) {
                throw new Error('Não foi possível encontrar todas as URLs do Ngrok necessárias');
            }
            return urls;
        });
    }
    async validateUrls(urls) {
        const validations = await Promise.all([
            urls.frontend && this.validateUrl(urls.frontend),
            urls.backend && this.validateUrl(urls.backend)
        ]);
        if (!validations.every(isValid => isValid)) {
            throw new Error('Uma ou mais URLs não estão respondendo corretamente');
        }
    }
    async updateDuckDNS(urls) {
        const domain = process.env.DUCKDNS_DOMAIN;
        const token = process.env.DUCKDNS_TOKEN;
        if (!domain || !token) {
            throw new Error('Credenciais DuckDNS não configuradas');
        }
        const record = {
            frontend: urls.frontend || '',
            backend: urls.backend || '',
            updated_at: new Date().toISOString(),
            version: '1.0'
        };
        const encodedRecord = encodeURIComponent(JSON.stringify(record));
        const updateUrl = `https://www.duckdns.org/update?domains=${domain}&token=${token}&txt=${encodedRecord}`;
        const response = await axios_1.default.get(updateUrl);
        if (!response.data.includes('OK')) {
            throw new Error('Falha ao atualizar registro no DuckDNS');
        }
        this.emit('duckdns-updated', record);
    }
    async startUrlMonitoring() {
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
            }
            catch (error) {
                console.error('Erro no monitoramento de URLs:', error.message);
                this.emit('monitoring-error', error);
            }
        };
        // Executa imediatamente e depois a cada intervalo
        await monitor();
        this.monitoringInterval = setInterval(monitor, this.config.timeouts.monitoring);
    }
    async stopUrlMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
    getCurrentUrls() {
        return { ...this.urls };
    }
}
exports.default = UrlManager;
//# sourceMappingURL=urlManager.js.map
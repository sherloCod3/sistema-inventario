"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const axios_1 = __importDefault(require("axios"));
const util_1 = __importDefault(require("util"));
const execAsync = util_1.default.promisify(child_process_1.exec);
class StartupManager {
    constructor() {
        this.processes = {};
        this.urls = {
            frontend: null,
            backend: null,
            ngrok: null,
        };
        this.log = {
            info: (msg) => console.log(`\x1b[34mℹ️ ${msg}\x1b[0m`),
            success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
            error: (msg) => console.error(`\x1b[31m❌ ${msg}\x1b[0m`),
            warning: (msg) => console.warn(`\x1b[33m⚠️ ${msg}\x1b[0m`),
            debug: (msg) => process.env.DEBUG && console.debug(`\x1b[90m🔍 ${msg}\x1b[0m`),
        };
    }
    async initialize() {
        try {
            this.log.info("Validando ambiente...");
            await this.validateEnvironment();
            this.log.info("Liberando portas...");
            await this.checkAndKillPorts([3000, 5000, 4040]);
            this.log.info("Iniciando serviços...");
            await this.startServices();
            this.log.info("Configurando Ngrok...");
            const tunnels = await this.configureNgrok();
            this.urls.frontend = tunnels.frontend;
            this.urls.backend = tunnels.backend;
            this.log.info("Validando URLs...");
            await this.validateUrls([this.urls.frontend, this.urls.backend]);
            this.log.success("Sistema iniciado com sucesso!");
            this.displayUrls();
        }
        catch (error) {
            this.log.error(`Erro durante a inicialização: ${error.message}`);
            await this.cleanup();
            process.exit(1);
        }
    }
    async validateEnvironment() {
        const dependencies = ["node", "npm", "ngrok"];
        for (const dep of dependencies) {
            try {
                await execAsync(`which ${dep}`);
                this.log.success(`Dependência ${dep} encontrada`);
            }
            catch (_a) {
                throw new Error(`Dependência não encontrada: ${dep}`);
            }
        }
    }
    async checkAndKillPorts(ports) {
        for (const port of ports) {
            try {
                const platform = process.platform;
                if (platform === "win32") {
                    await execAsync(`netstat -ano | findstr :${port}`);
                }
                else {
                    await execAsync(`lsof -i :${port} -t | xargs kill -9`);
                }
                this.log.success(`Porta ${port} liberada`);
            }
            catch (_a) {
                this.log.debug(`Nenhum processo encontrado na porta ${port}`);
            }
        }
    }
    async startServices() {
        this.processes.backend = this.runProcess("npm", ["run", "dev"], "Backend");
        this.processes.frontend = this.runProcess("npm", ["start"], "Frontend");
        this.processes.ngrok = this.runProcess("ngrok", ["start", "--all"], "Ngrok");
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Espera inicialização
    }
    runProcess(command, args, name) {
        const proc = (0, child_process_1.spawn)(command, args, { shell: true });
        proc.stdout.on("data", (data) => this.log.debug(`[${name}] ${data}`));
        proc.stderr.on("data", (data) => this.log.error(`[${name}] ERR: ${data}`));
        return proc;
    }
    async configureNgrok() {
        var _a, _b;
        const response = await axios_1.default.get("http://localhost:4040/api/tunnels");
        const tunnels = response.data.tunnels;
        return {
            frontend: (_a = tunnels.find((t) => t.config.addr.includes(":3000"))) === null || _a === void 0 ? void 0 : _a.public_url,
            backend: (_b = tunnels.find((t) => t.config.addr.includes(":5000"))) === null || _b === void 0 ? void 0 : _b.public_url,
        };
    }
    async validateUrls(urls) {
        for (const url of urls) {
            if (url) {
                try {
                    const response = await axios_1.default.get(url, { timeout: 5000 });
                    if (response.status === 200) {
                        this.log.success(`URL válida: ${url}`);
                    }
                    else {
                        this.log.warning(`URL com status ${response.status}: ${url}`);
                    }
                }
                catch (_a) {
                    this.log.error(`URL inacessível: ${url}`);
                }
            }
        }
    }
    displayUrls() {
        console.log("\nLocal:");
        console.log(`  Frontend: http://localhost:3000`);
        console.log(`  Backend: http://localhost:5000`);
        console.log("\nNgrok:");
        console.log(`  Frontend: ${this.urls.frontend}`);
        console.log(`  Backend: ${this.urls.backend}`);
    }
    async cleanup() {
        this.log.info("Encerrando processos...");
        for (const proc of Object.values(this.processes)) {
            if (proc && !proc.killed) {
                proc.kill();
            }
        }
    }
}
if (require.main === module) {
    const manager = new StartupManager();
    manager.initialize();
}
//# sourceMappingURL=startupManager.js.map
import { exec } from "child_process";
import axios from "axios";
import util from "util";

const execAsync = util.promisify(exec);

class StartupManager {
    private processes: Record<string, any> = {};
    private urls: Record<string, string | null> = {
        frontend: null,
        backend: null,
        ngrok: null,
    };

    private log = {
        info: (msg: string) => console.log(`\x1b[34mℹ️ ${msg}\x1b[0m`),
        success: (msg: string) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
        error: (msg: string) => console.error(`\x1b[31m❌ ${msg}\x1b[0m`),
        warning: (msg: string) => console.warn(`\x1b[33m⚠️ ${msg}\x1b[0m`),
        debug: (msg: string) => process.env.DEBUG && console.debug(`\x1b[90m🔍 ${msg}\x1b[0m`),
    };

    public async initialize(): Promise<void> {
        try {
            this.log.info("Configurando URL estática do Ngrok...");

            // Defina a URL estática diretamente
            this.urls.frontend = process.env.NGROK_STATIC_URL || 'http://localhost:3000';
            this.urls.backend = process.env.NGROK_STATIC_URL || 'http://localhost:5000';

            if (!this.urls.frontend || !this.urls.backend) {
                this.log.warning("Ngrok falhou, continuando com localhost...");
            } else {
                this.log.success(`Ngrok URL estática configurada: ${this.urls.frontend}`);
            }
        } catch (error) {
            const errorMessage = (error as Error).message;
            this.log.error(`Erro ao configurar Ngrok: ${errorMessage}`);
            this.log.warning("Falha no Ngrok, continuando em modo localhost.");
        }
    }

    public async startNgrok(): Promise<void> {
        try {
            // Verifica se o Ngrok está ativo acessando o endpoint padrão
            const response = await axios.get('http://localhost:4040/api/tunnels');
            if (response.data.tunnels.length > 0) {
                this.log.success("Ngrok já está ativo.");
                return;
            }
        } catch {
            this.log.info("Ngrok não está ativo. Tentando iniciar...");
        }

        // Inicializa o Ngrok com o comando especificado
        try {
            const ngrokCommand = `ngrok http --url=${process.env.NGROK_STATIC_URL || 'http://localhost:80'}`;
            await execAsync(ngrokCommand);
            this.log.success("Ngrok inicializado com sucesso.");
        } catch (error) {
            const errorMessage = (error as Error).message;
            this.log.error(`Erro ao iniciar o Ngrok: ${errorMessage}`);
            throw new Error("Falha ao iniciar o Ngrok.");
        }
    }

    public getUrls(): Record<string, string | null> {
        return this.urls;
    }
}

export default StartupManager;

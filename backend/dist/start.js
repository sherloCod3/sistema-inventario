"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const startupService_1 = require("./services/startupService");
const logger_1 = require("./config/logger");
const envCheck_1 = require("./utils/envCheck");
const config_1 = require("./config");
dotenv_1.default.config();
async function main() {
    logger_1.logger.info('🚀 Iniciando sistema de inventário...');
    try {
        (0, envCheck_1.checkRequiredEnvVars)();
        const startup = new startupService_1.StartupService(config_1.config);
        await startup.start();
        logger_1.logger.info('✅ Sistema iniciado com sucesso!');
    }
    catch (error) {
        logger_1.logger.error('❌ Erro ao iniciar sistema:', error);
        process.exit(1);
    }
}
// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
    logger_1.logger.error('❌ Erro não tratado:', error);
    process.exit(1);
});
process.on('SIGTERM', async () => {
    logger_1.logger.info('🛑 Recebido sinal de término...');
    process.exit(0);
});
// Executa o programa
main().catch(error => {
    logger_1.logger.error('❌ Erro fatal:', error);
    process.exit(1);
});
//# sourceMappingURL=start.js.map
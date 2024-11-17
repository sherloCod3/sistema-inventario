"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const database_1 = __importDefault(require("./config/database"));
const logger_1 = require("./config/logger");
const auth_1 = __importDefault(require("./routes/auth"));
const inventory_1 = __importDefault(require("./routes/inventory")); // 👈 Nome atualizado
// Carrega as variáveis de ambiente
dotenv_1.default.config();
// Inicializa o Express
const app = (0, express_1.default)();
// Middleware de segurança
app.use((0, helmet_1.default)());
// Configuração do CORS
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permite requisições sem origin (como mobile apps ou curl)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Bloqueado pelo CORS'));
        }
    },
    credentials: true
}));
// Middleware para parser JSON
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Middleware de logging básico
app.use((req, _res, next) => {
    logger_1.logger.info(`${req.method} ${req.url}`);
    next();
});
// Rotas
app.use('/api/auth', auth_1.default);
app.use('/api/inventory', inventory_1.default); // 👈 Nome atualizado
// Rota de health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Handler para rotas não encontradas
app.use((_req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});
// Handler global de erros
app.use((err, _req, res, _next) => {
    logger_1.logger.error('Erro não tratado:', err);
    res.status(500).json({
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Porta do servidor
const PORT = process.env.PORT || 5000;
// Função para iniciar o servidor
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Conecta ao MongoDB
        yield (0, database_1.default)();
        // Inicia o servidor
        app.listen(PORT, () => {
            logger_1.logger.info(`✅ Servidor rodando na porta ${PORT}`);
            logger_1.logger.info(`📑 Ambiente: ${process.env.NODE_ENV}`);
            logger_1.logger.info(`🌐 CORS habilitado para: ${allowedOrigins.join(', ')}`);
        });
    }
    catch (error) {
        logger_1.logger.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
});
// Handler para erros não tratados
process.on('unhandledRejection', (err) => {
    logger_1.logger.error('Erro não tratado:', err);
    process.exit(1);
});
// Inicia o servidor
startServer();

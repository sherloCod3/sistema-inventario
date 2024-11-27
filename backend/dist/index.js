"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const server_1 = __importDefault(require("./config/server"));
const logger_1 = require("./config/logger");
const database_1 = __importDefault(require("./config/database"));
const auth_1 = __importDefault(require("./routes/auth"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));
// CORS configuration
app.use((0, cors_1.default)(server_1.default.corsOptions));
// Basic middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging
app.use((req, _res, next) => {
    logger_1.logger.info({
        method: req.method,
        url: req.url,
        origin: req.headers.origin || 'No origin',
        ip: req.ip
    });
    next();
});
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/inventory', inventory_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});
// Global error handler
app.use((err, _req, res, _next) => {
    logger_1.logger.error('Erro não tratado:', err);
    res.status(500).json({
        message: 'Erro interno do servidor',
        error: server_1.default.nodeEnv === 'development' ? err.message : undefined
    });
});
// Start server
const startServer = async () => {
    try {
        await (0, database_1.default)();
        const HOST = '0.0.0.0'; // Permite conexões de qualquer origem
        app.listen(server_1.default.port, HOST, () => {
            logger_1.logger.info(`✅ Servidor rodando em http://${HOST}:${server_1.default.port}`);
            logger_1.logger.info(`📑 Ambiente: ${server_1.default.nodeEnv}`);
            logger_1.logger.info(`🌐 CORS habilitado para:`, server_1.default.allowedOrigins);
        });
    }
    catch (error) {
        logger_1.logger.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
};
// Handle uncaught errors
process.on('unhandledRejection', (err) => {
    logger_1.logger.error('Erro não tratado:', err);
    process.exit(1);
});
startServer();
//# sourceMappingURL=index.js.map
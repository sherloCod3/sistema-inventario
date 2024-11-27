"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./logger");
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI || '';
        if (!mongoURI) {
            throw new Error('MongoDB URI não configurada nas variáveis de ambiente');
        }
        logger_1.logger.info('Iniciando conexão com MongoDB...');
        const options = {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            maxPoolSize: 10,
            minPoolSize: 5,
            retryWrites: true,
            retryReads: true,
            w: 'majority',
        };
        await mongoose_1.default.connect(mongoURI, options);
        logger_1.logger.info('Conexão com MongoDB estabelecida com sucesso');
        // Adiciona listeners para eventos de conexão
        mongoose_1.default.connection.on('connected', () => {
            logger_1.logger.info('Mongoose conectado ao MongoDB');
        });
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.logger.error('Erro na conexão Mongoose:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.logger.warn('Mongoose desconectado do MongoDB');
        });
    }
    catch (error) {
        logger_1.logger.error('Erro ao conectar com MongoDB:', error);
        process.exit(1);
    }
};
// Tratamento de eventos do processo
process.on('SIGINT', async () => {
    try {
        await mongoose_1.default.connection.close();
        logger_1.logger.info('Conexão MongoDB fechada através de término de app');
        process.exit(0);
    }
    catch (err) {
        logger_1.logger.error('Erro ao fechar conexão MongoDB:', err);
        process.exit(1);
    }
});
exports.default = connectDB;
//# sourceMappingURL=database.js.map
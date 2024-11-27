"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scripts/initDb.ts
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../config/logger");
dotenv_1.default.config();
const initializeDatabase = async () => {
    try {
        const mongoURI = process.env.MONGODB_ATLAS_URI || '';
        if (!mongoURI) {
            throw new Error('MongoDB URI não configurada');
        }
        await mongoose_1.default.connect(mongoURI);
        logger_1.logger.info('Conectado ao MongoDB');
        const db = mongoose_1.default.connection.db;
        if (!db) {
            throw new Error('Conexão com o banco de dados não estabelecida');
        }
        // Verifica se a coleção sequences existe
        const collections = await db.listCollections({ name: 'sequences' }).toArray();
        if (collections.length === 0) {
            logger_1.logger.info('Criando coleção sequences...');
            await db.createCollection('sequences');
        }
        // Verifica se o documento de sequência existe
        const sequencesCollection = db.collection('sequences');
        const sequence = await sequencesCollection.findOne({
            _id: 'patrimonyId'
        }); // Usamos any aqui para contornar a tipagem estrita do MongoDB
        if (!sequence) {
            logger_1.logger.info('Criando documento de sequência inicial...');
            await sequencesCollection.insertOne({
                _id: 'patrimonyId',
                seq: 0
            }); // Usamos any aqui para contornar a tipagem estrita do MongoDB
            logger_1.logger.info('Documento de sequência criado com sucesso');
        }
        else {
            logger_1.logger.info('Documento de sequência já existe');
        }
        logger_1.logger.info('Inicialização do banco de dados concluída com sucesso');
    }
    catch (error) {
        logger_1.logger.error('Erro ao inicializar banco de dados:', error);
        throw error;
    }
    finally {
        await mongoose_1.default.connection.close();
    }
};
// Executar a inicialização
initializeDatabase()
    .then(() => {
    logger_1.logger.info('Script de inicialização concluído');
    process.exit(0);
})
    .catch((error) => {
    logger_1.logger.error('Erro ao executar script de inicialização:', error);
    process.exit(1);
});
//# sourceMappingURL=initDb.js.map
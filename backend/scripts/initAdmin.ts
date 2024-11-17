import dotenv from 'dotenv';
import { connect } from 'mongoose';
import { createInitialAdmin } from '../../backend/src/controllers/authController';
import { logger } from '../../backend/src/config/logger';

dotenv.config();

const initializeAdmin = async () => {
    try {
        const mongoURI = process.env.MONGODB_ATLAS_URI;
        if (!mongoURI) {
            throw new Error('MongoDB URI não configurada');
        }

        await connect(mongoURI);
        logger.info('Conectado ao MongoDB');

        await createInitialAdmin();
        logger.info('Processo de inicialização concluído');

        process.exit(0);
    } catch (error) {
        logger.error('Erro na inicialização:', error);
        process.exit(1);
    }
};

initializeAdmin();
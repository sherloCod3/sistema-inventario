import mongoose, { WriteConcern } from 'mongoose';
import { logger } from './logger';



const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI || '';
    
    if (!mongoURI) {
      throw new Error('MongoDB URI não configurada nas variáveis de ambiente');
    }

    logger.info('Iniciando conexão com MongoDB...');
    
    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      retryReads: true,
      w: 'majority',
    };

    await mongoose.connect(mongoURI, options);

    logger.info('Conexão com MongoDB estabelecida com sucesso');
    
    // Adiciona listeners para eventos de conexão
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose conectado ao MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Erro na conexão Mongoose:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose desconectado do MongoDB');
    });

  } catch (error) {
    logger.error('Erro ao conectar com MongoDB:', error);
    process.exit(1);
  }
};

// Tratamento de eventos do processo
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('Conexão MongoDB fechada através de término de app');
    process.exit(0);
  } catch (err) {
    logger.error('Erro ao fechar conexão MongoDB:', err);
    process.exit(1);
  }
});

export default connectDB;
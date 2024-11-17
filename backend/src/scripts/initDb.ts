// src/scripts/initDb.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from '../config/logger';
import { ObjectId } from 'mongodb';

dotenv.config();

interface ISequence {
  _id: string;
  seq: number;
}

const initializeDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_ATLAS_URI || '';
    
    if (!mongoURI) {
      throw new Error('MongoDB URI não configurada');
    }

    await mongoose.connect(mongoURI);
    logger.info('Conectado ao MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Conexão com o banco de dados não estabelecida');
    }

    // Verifica se a coleção sequences existe
    const collections = await db.listCollections({ name: 'sequences' }).toArray();
    
    if (collections.length === 0) {
      logger.info('Criando coleção sequences...');
      await db.createCollection('sequences');
    }

    // Verifica se o documento de sequência existe
    const sequencesCollection = db.collection('sequences');
    const sequence = await sequencesCollection.findOne({ 
      _id: 'patrimonyId'
    } as any); // Usamos any aqui para contornar a tipagem estrita do MongoDB

    if (!sequence) {
      logger.info('Criando documento de sequência inicial...');
      await sequencesCollection.insertOne({
        _id: 'patrimonyId',
        seq: 0
      } as any); // Usamos any aqui para contornar a tipagem estrita do MongoDB
      logger.info('Documento de sequência criado com sucesso');
    } else {
      logger.info('Documento de sequência já existe');
    }

    logger.info('Inicialização do banco de dados concluída com sucesso');
  } catch (error) {
    logger.error('Erro ao inicializar banco de dados:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
};

// Executar a inicialização
initializeDatabase()
  .then(() => {
    logger.info('Script de inicialização concluído');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Erro ao executar script de inicialização:', error);
    process.exit(1);
  });
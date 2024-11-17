import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carrega o .env na memória
dotenv.config();

const testConnection = async () => {
  try {
    const mongoURI = process.env.MONGODB_ATLAS_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI não está definido no arquivo .env');
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log('✅ Conexão com o MongoDB estabelecida com sucesso!');
    console.log('MONGODB_ATLAS_URI:', process.env.MONGODB_ATLAS_URI);
    console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    console.log('MONGODB_ATLAS_URI:', process.env.MONGODB_ATLAS_URI);
    console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

testConnection();
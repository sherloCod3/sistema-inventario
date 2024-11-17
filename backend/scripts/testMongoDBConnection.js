import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testMongoDBConnection = async () => {
  try {
    const mongoURI = process.env.MONGODB_ATLAS_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI não está definido');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conexão com o MongoDB estabelecida com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
  } finally {
    await mongoose.connection.close();
  }
};

testMongoDBConnection();

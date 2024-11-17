require('dotenv').config();
const mongoose = require('mongoose');

const validateAndTestConnection = async () => {
  try {
    const uri = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('URI de conexão não encontrada no arquivo .env');
    }

    // Valida o formato da URI
    if (uri.includes('mongodb+srv://')) {
      if (uri.match(/:\d+\//)) {
        throw new Error('URIs mongodb+srv não podem conter número de porta');
      }
    }

    console.log('\nTentando conectar ao MongoDB...');
    console.log(`URI: ${uri.replace(/\/\/[^:]+:([^@]+)@/, '//[USERNAME]:[PASSWORD]@')}`);

    await mongoose.connect(uri);
    
    console.log('\n✅ Conexão estabelecida com sucesso!\n');
    
    // Informações adicionais
    console.log('Informações da conexão:');
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Estado: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nColeções disponíveis:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

  } catch (error) {
    console.error('\n❌ Erro ao conectar ao MongoDB:');
    console.error(error.message);
    
    if (error.message.includes('URI não encontrada')) {
      console.log('\nDica: Verifique se o arquivo .env existe e contém MONGODB_ATLAS_URI ou MONGODB_URI');
    } else if (error.message.includes('porta')) {
      console.log('\nDica: Remova qualquer número de porta da string de conexão do MongoDB Atlas');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\nDica: Verifique se o usuário e senha estão corretos');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\nDica: Verifique se o nome do cluster está correto');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit();
  }
};

validateAndTestConnection();
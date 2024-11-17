require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('Iniciando teste de conexão...');
    console.log('Verificando variáveis de ambiente...');
    
    const mongoURI = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('Nenhuma URL de conexão MongoDB encontrada no arquivo .env');
    }

    // Mascara a senha na URL para log seguro
    const maskedURI = mongoURI.replace(
      /(mongodb\+srv:\/\/[^:]+:)([^@]+)(@.+)/,
      '$1****$3'
    );
    console.log(`\nTentando conectar usando: ${maskedURI}`);

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout após 5 segundos
    };

    console.log('\nOpções de conexão:', JSON.stringify(options, null, 2));

    // Tenta estabelecer a conexão
    await mongoose.connect(mongoURI, options);

    console.log('\n✅ Conexão estabelecida com sucesso!');
    
    // Informações detalhadas da conexão
    console.log('\nInformações da conexão:');
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Database: ${mongoose.connection.name || 'Nenhum banco especificado'}`);
    console.log(`Estado: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);

    // Lista coleções
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nColeções disponíveis:');
    if (collections.length === 0) {
      console.log('Nenhuma coleção encontrada');
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Erro ao conectar ao MongoDB:');
    console.error(`Tipo de erro: ${error.name}`);
    console.error(`Mensagem: ${error.message}`);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\nDica: Verifique se o cluster está acessível e se os IPs estão liberados no MongoDB Atlas');
    } else if (error.name === 'MongooseError') {
      console.log('\nDica: Verifique se a string de conexão está formatada corretamente');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\nDicas para autenticação:');
      console.log('1. Verifique se o usuário e senha estão corretos');
      console.log('2. Certifique-se que o usuário tem as permissões necessárias');
      console.log('3. Verifique se o usuário está associado ao banco de dados correto');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\nConexão fechada');
    }
    process.exit();
  }
};

testConnection();
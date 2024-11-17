import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const inventorySchema = new mongoose.Schema({
  // Defina os campos do inventário de acordo com sua estrutura
});

const Inventory = mongoose.model('Inventory', inventorySchema);

const testFind = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URI as string, {
        serverSelectionTimeoutMS: 10000, // Tempo limite para selecionar o servidor
        connectTimeoutMS: 20000,         // Tempo limite para a conexão inicial
        socketTimeoutMS: 45000,          // Tempo limite para operações de socket
      });
      

    const items = await Inventory.find();  // Tenta buscar documentos
    console.log('Itens encontrados:', items);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Erro ao buscar itens na coleção inventories:', error);
  }
};

testFind();

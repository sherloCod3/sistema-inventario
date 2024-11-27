// src/server.ts
import * as dotenv from 'dotenv';
import path from 'path';
import express from 'express';

// Configuração do dotenv no início
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Log para debug
console.log('Environment variables loaded from:', envPath);
console.log('MONGODB_ATLAS_URI:', process.env.MONGODB_ATLAS_URI);
import { corsMiddleware } from './config/cors';
import routes from './routes';
import { logger } from './config/logger';
import connectDB from './config/database';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

export async function startServer() {
  await connectDB();
  
  corsMiddleware(app);
  app.use(express.json());
  app.use('/api', routes);
  app.get('/health', (_, res) => res.status(200).json({ status: 'ok' }));

  return app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}
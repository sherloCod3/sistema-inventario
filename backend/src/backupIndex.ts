// src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/server';
import { logger } from './config/logger';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import inventoryRouter from './routes/inventory';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));

// CORS configuration
app.use(cors(config.corsOptions));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    origin: req.headers.origin || 'No origin',
    ip: req.ip
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRouter);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Erro não tratado:', err);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    const HOST = '0.0.0.0'; // Permite conexões de qualquer origem

    const server = app.listen(PORT, HOST, () => {
      logger.info(`✅ Servidor rodando em http://${HOST}:${PORT}`);
      logger.info(`📑 Ambiente: ${config.nodeEnv}`);
      logger.info(`🌐 CORS habilitado para:`, config.allowedOrigins);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM recebido. Encerrando servidor...');
      server.close(() => {
        logger.info('Servidor encerrado');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('unhandledRejection', (err: Error) => {
  logger.error('Erro não tratado:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Exceção não tratada:', err);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer().catch((error) => {
    logger.error('Erro fatal ao iniciar servidor:', error);
    process.exit(1);
  });
}

export default app;
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import connectDB from './config/database';
import { logger } from './config/logger';
import authRoutes from './routes/auth';
import inventoryRouter from './routes/inventory'; // 👈 Nome atualizado
import { rateLimiter, timeoutMiddleware, haltOnTimedout, helmetConfig } from './middleware/security';
import { configureMiddleware } from './config/config';

// Carrega as variáveis de ambiente
dotenv.config();

// Inicializa o Express
const app = express();

// Middleware de segurança
app.use(helmet());

// Configuração do CORS
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (como mobile apps ou curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS'));
    }
  },
  credentials: true
}));

configureMiddleware(app);

// Middleware de segurança
app.use(helmetConfig);
app.use(rateLimiter);
app.use(timeoutMiddleware);
app.use(haltOnTimedout);


// Middleware para parser JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging básico
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRouter); // 👈 Nome atualizado

// Rota de health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Handler para rotas não encontradas
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Handler global de erros
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Erro não tratado:', err);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Porta do servidor
const PORT = Number(process.env.PORT) || 5000;

// Função para iniciar o servidor
const startServer = async () => {
  try {
    // Conecta ao MongoDB
    await connectDB();
    
    // Inicia o servidor
    const HOST = '0.0.0.0';
    app.listen(PORT, HOST, () => {
      logger.info(`✅ Servidor rodando em http://${HOST}:${PORT}`);
      //logger.info(`✅ Servidor rodando na porta ${PORT}`);
      logger.info(`📑 Ambiente: ${process.env.NODE_ENV}`);
      logger.info(`🌐 CORS habilitado para: ${allowedOrigins.join(', ')}`);
    });

  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Handler para erros não tratados
process.on('unhandledRejection', (err: Error) => {
  logger.error('Erro não tratado:', err);
  process.exit(1);
});

// Inicia o servidor
startServer();
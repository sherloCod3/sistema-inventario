import cors from 'cors';
import { Application, Request, Response, NextFunction } from 'express';
import { logger } from './logger';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  /\.ngrok-free\.app$/,
  /\.ngrok\.io$/,
  /\.freeddns\.org$/,
  /\.duckdns\.org$/,
  /\.netlify\.app$/,

  process.env.DDNS_URL || 'http://inventoryupa.freeddns.org:3000',
  process.env.FRONTEND_URL || '' // Fallback para string vazia se não configurado
];

export const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      console.info('[CORS] Requisição sem origem (provavelmente local ou app móvel).');
      return callback(null, true);
    }

    const isAllowed = allowedOrigins.some(allowed =>
      typeof allowed === 'string'
        ? allowed === origin
        : allowed instanceof RegExp && allowed.test(origin)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Origem bloqueada: ${origin}`);
      callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'ngrok-skip-browser-warning',
    'x-requested-with'
  ],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  maxAge: 86400
};

export const corsMiddleware = (app: Application): void => {
  // Middleware principal do CORS
  app.use(cors(corsOptions));

  // Middleware adicional para garantir compatibilidade
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-requested-with');

    if (req.method === 'OPTIONS') {
      console.info(`[CORS] Requisição OPTIONS recebida: ${req.path}`);
      return res.sendStatus(200);
    }
    next();
  });

  app.use((req, res, next) => {
    if (!req.headers.origin && process.env.NODE_ENV === 'development') {
      logger.debug(`[CORS] Requisição sem origem detectada`);
    }
    next();
  });


};
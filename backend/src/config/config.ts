import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { logger } from './logger';
import { CorsOptions } from 'cors';


export const configureMiddleware = (app: express.Application) => {
  app.use(cors({
    origin: '*', // Temporariamente para teste
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // config.ts
  type AllowedOrigins = CorsOptions['origin'];
  const allowedOrigins: AllowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL ?? '']
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
    exposedHeaders: ['Content-Range', 'X-Total-Count']
  }));

  // Headers adicionais de CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false
  }));

  app.use((req, res, next) => {
    logger.info({
      method: req.method,
      url: req.url,
      origin: req.headers.origin,
      host: req.headers.host,
      ip: req.ip
    });
    next();
  });

  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.message === 'Not allowed by CORS') {
      logger.warn(`CORS blocked request from origin: ${req.headers.origin}`);
      res.status(403).json({ message: 'Não autorizado para acessar este recurso' });
    } else {
      next(err);
    }
  });
};
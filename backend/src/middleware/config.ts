import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { logger } from '../config/logger';

export const configureMiddleware = (app: express.Application) => {
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const allowedOrigins = [
    'http://localhost:3000',
    'http://inventoryupa.ip-ddns.com:3000',
    'http://inventoryupa.ip-ddns.com:5000'
  ];

  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range', 'Access-Control-Allow-Origin'],
    maxAge: 86400
  }));

  // Headers adicionais de CORS
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false
  }));

  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.message === 'Not allowed by CORS') {
      logger.warn(`CORS blocked request from origin: ${req.headers.origin}`);
      res.status(403).json({ message: 'Não autorizado para acessar este recurso' });
    } else {
      next(err);
    }
  });
};
// src/middleware/config.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { logger } from '../config/logger';

export const configureMiddleware = (app: express.Application) => {
  // Logging middleware
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Parse JSON bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Configure CORS
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
  
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Permitir requisições sem origin (como mobile apps ou curl)
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // 10 minutos
  };

  app.use(cors(corsOptions));

  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin'
    }
  }));

  // Error handling para CORS e outros erros de middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.message === 'Not allowed by CORS') {
      logger.warn(`CORS blocked request from origin: ${req.headers.origin}`);
      res.status(403).json({
        message: 'Não autorizado para acessar este recurso'
      });
    } else {
      next(err);
    }
  });
};
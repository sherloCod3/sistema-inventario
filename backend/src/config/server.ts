// src/config/server.ts
import dotenv from 'dotenv';
import { CorsOptions } from 'cors';

dotenv.config();

interface ServerConfig {
  port: number;
  nodeEnv: string;
  corsOptions: CorsOptions;
  allowedOrigins: string[];
}

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  process.env.DDNS_URL || 'http://inventoryupa.freeddns.org:3000',
  // Ngrok URLs (incluindo subdomínios gratuitos)
  /^.*\.ngrok-free\.app$/,
  /^.*\.ngrok\.io$/
];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permite requests sem origin (como apps mobile ou Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Verifica se a origem está na lista ou corresponde aos padrões regex
    const isAllowed = allowedOrigins.some(allowed => 
      typeof allowed === 'string' 
        ? allowed === origin 
        : allowed instanceof RegExp 
          ? allowed.test(origin)
          : false
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Origem bloqueada: ${origin}`);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'ngrok-skip-browser-warning' // Permite requisições do Ngrok sem warning
  ],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  maxAge: 86400, // 24 horas
};

const config: ServerConfig = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOptions,
  allowedOrigins: allowedOrigins as string[]
};

export default config;
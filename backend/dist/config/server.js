"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/config/server.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
const corsOptions = {
    origin: (origin, callback) => {
        // Permite requests sem origin (como apps mobile ou Postman)
        if (!origin) {
            return callback(null, true);
        }
        // Verifica se a origem está na lista ou corresponde aos padrões regex
        const isAllowed = allowedOrigins.some(allowed => typeof allowed === 'string'
            ? allowed === origin
            : allowed instanceof RegExp
                ? allowed.test(origin)
                : false);
        if (isAllowed) {
            callback(null, true);
        }
        else {
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
const config = {
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOptions,
    allowedOrigins: allowedOrigins
};
exports.default = config;
//# sourceMappingURL=server.js.map
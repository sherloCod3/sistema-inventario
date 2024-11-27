"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = exports.corsOptions = void 0;
const cors_1 = __importDefault(require("cors"));
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    /\.ngrok-free\.app$/,
    /\.ngrok\.io$/,
    /\.freeddns\.org$/,
    /\.duckdns\.org$/,
    process.env.DDNS_URL || 'http://inventoryupa.freeddns.org:3000',
    process.env.FRONTEND_URL || '' // Fallback para string vazia se não configurado
];
exports.corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            console.info('[CORS] Requisição sem origem (provavelmente local ou app móvel).');
            return callback(null, true);
        }
        const isAllowed = allowedOrigins.some(allowed => typeof allowed === 'string'
            ? allowed === origin
            : allowed instanceof RegExp && allowed.test(origin));
        if (isAllowed) {
            callback(null, true);
        }
        else {
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
const corsMiddleware = (app) => {
    // Middleware principal do CORS
    app.use((0, cors_1.default)(exports.corsOptions));
    // Middleware adicional para garantir compatibilidade
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-requested-with');
        if (req.method === 'OPTIONS') {
            console.info(`[CORS] Requisição OPTIONS recebida: ${req.path}`);
            return res.sendStatus(200);
        }
        next();
    });
};
exports.corsMiddleware = corsMiddleware;
//# sourceMappingURL=cors.js.map
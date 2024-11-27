"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureMiddleware = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const logger_1 = require("./logger");
const configureMiddleware = (app) => {
    var _a;
    app.use((0, cors_1.default)({
        origin: '*', // Temporariamente para teste
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    const allowedOrigins = process.env.NODE_ENV === 'production'
        ? [(_a = process.env.FRONTEND_URL) !== null && _a !== void 0 ? _a : '']
        : ['http://localhost:3000'];
    app.use((0, cors_1.default)({
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
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginEmbedderPolicy: false
    }));
    app.use((req, res, next) => {
        logger_1.logger.info({
            method: req.method,
            url: req.url,
            origin: req.headers.origin,
            host: req.headers.host,
            ip: req.ip
        });
        next();
    });
    app.use((err, req, res, next) => {
        if (err.message === 'Not allowed by CORS') {
            logger_1.logger.warn(`CORS blocked request from origin: ${req.headers.origin}`);
            res.status(403).json({ message: 'Não autorizado para acessar este recurso' });
        }
        else {
            next(err);
        }
    });
};
exports.configureMiddleware = configureMiddleware;
//# sourceMappingURL=config.js.map
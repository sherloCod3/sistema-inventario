"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureMiddleware = void 0;
// src/middleware/config.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const logger_1 = require("../config/logger");
const configureMiddleware = (app) => {
    var _a;
    // Logging middleware
    if (process.env.NODE_ENV === 'development') {
        app.use((0, morgan_1.default)('dev'));
    }
    // Parse JSON bodies
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // Configure CORS
    const allowedOrigins = ((_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(',')) || ['http://localhost:3000'];
    const corsOptions = {
        origin: (origin, callback) => {
            // Permitir requisições sem origin (como mobile apps ou curl)
            if (!origin) {
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        maxAge: 600 // 10 minutos
    };
    app.use((0, cors_1.default)(corsOptions));
    // Security middleware
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: {
            policy: 'cross-origin'
        }
    }));
    // Error handling para CORS e outros erros de middleware
    app.use((err, req, res, next) => {
        if (err.message === 'Not allowed by CORS') {
            logger_1.logger.warn(`CORS blocked request from origin: ${req.headers.origin}`);
            res.status(403).json({
                message: 'Não autorizado para acessar este recurso'
            });
        }
        else {
            next(err);
        }
    });
};
exports.configureMiddleware = configureMiddleware;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helmetConfig = exports.haltOnTimedout = exports.timeoutMiddleware = exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const connect_timeout_1 = __importDefault(require("connect-timeout"));
const helmet_1 = __importDefault(require("helmet"));
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100
});
exports.timeoutMiddleware = (0, connect_timeout_1.default)('30s');
const haltOnTimedout = (req, res, next) => {
    if (!req.timedout)
        next();
};
exports.haltOnTimedout = haltOnTimedout;
exports.helmetConfig = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'",
                /* 'http://localhost:3000',
                'http://inventoryupa.freeddns.org:3000',
                'https://inventoryupa.freeddns.org' */
            ],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
});
//# sourceMappingURL=security.js.map
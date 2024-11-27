"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    ports: {
        frontend: parseInt(process.env.FRONTEND_PORT || '3000', 10),
        backend: parseInt(process.env.BACKEND_PORT || '5000', 10),
        ngrok: parseInt(process.env.NGROK_PORT || '4040', 10),
    },
    mongodb: {
        uri: process.env.MONGODB_ATLAS_URI || '',
    },
    jwt: {
        secret: process.env.JWT_SECRET || '',
    },
    duckdns: {
        domain: process.env.DUCKDNS_DOMAIN || '',
        token: process.env.DUCKDNS_TOKEN || '',
    },
    retries: {
        maxAttempts: 3,
        delay: 2000
    }
};
//# sourceMappingURL=index.js.map
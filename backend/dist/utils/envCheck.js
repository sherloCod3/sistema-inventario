"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRequiredEnvVars = checkRequiredEnvVars;
const logger_1 = require("../config/logger");
function checkRequiredEnvVars() {
    const requiredVars = ['PORT', 'BACKEND_PORT', 'MONGODB_ATLAS_URI', 'JWT_SECRET', 'DUCKDNS_DOMAIN', 'DUCKDNS_TOKEN'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
        logger_1.logger.error(errorMessage);
        throw new Error(errorMessage);
    }
}
//# sourceMappingURL=envCheck.js.map
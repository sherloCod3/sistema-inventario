"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSystemAvailability = checkSystemAvailability;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../config/logger");
async function checkSystemAvailability(backendUrl) {
    if (!backendUrl) {
        throw new Error('Backend URL not available for system check');
    }
    try {
        const response = await axios_1.default.get(`${backendUrl}/api/health`);
        if (response.status === 200) {
            logger_1.logger.info('System is available and responding');
        }
        else {
            throw new Error('System health check failed');
        }
    }
    catch (error) {
        logger_1.logger.error('Error checking system availability:', error);
        throw error;
    }
}
//# sourceMappingURL=systemCheck.js.map
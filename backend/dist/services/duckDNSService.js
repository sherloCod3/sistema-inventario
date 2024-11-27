"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDuckDNS = updateDuckDNS;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../config/logger");
async function updateDuckDNS(ip) {
    const domain = process.env.DUCKDNS_DOMAIN;
    const token = process.env.DUCKDNS_TOKEN;
    try {
        const response = await axios_1.default.get(`https://www.duckdns.org/update?domains=${domain}&token=${token}&ip=${ip}`);
        if (response.data === 'OK') {
            logger_1.logger.info(`DuckDNS updated successfully for domain: ${domain}`);
        }
        else {
            throw new Error(`Failed to update DuckDNS: ${response.data}`);
        }
    }
    catch (error) {
        logger_1.logger.error('Error updating DuckDNS:', error);
        throw error;
    }
}
//# sourceMappingURL=duckDNSService.js.map
import axios from 'axios';
import { logger } from '../config/logger';

export async function updateDuckDNS(ip: string) {
  const domain = process.env.DUCKDNS_DOMAIN;
  const token = process.env.DUCKDNS_TOKEN;

  try {
    const response = await axios.get(`https://www.duckdns.org/update?domains=${domain}&token=${token}&ip=${ip}`);
    if (response.data === 'OK') {
      logger.info(`DuckDNS updated successfully for domain: ${domain}`);
    } else {
      throw new Error(`Failed to update DuckDNS: ${response.data}`);
    }
  } catch (error) {
    logger.error('Error updating DuckDNS:', error);
    throw error;
  }
}
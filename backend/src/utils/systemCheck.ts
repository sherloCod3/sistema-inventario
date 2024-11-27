import axios from 'axios';
import { logger } from '../config/logger';

export async function checkSystemAvailability(backendUrl: string | null): Promise<void> {
  if (!backendUrl) {
    throw new Error('Backend URL not available for system check');
  }

  try {
    const response = await axios.get(`${backendUrl}/api/health`);
    if (response.status === 200) {
      logger.info('System is available and responding');
    } else {
      throw new Error('System health check failed');
    }
  } catch (error) {
    logger.error('Error checking system availability:', error);
    throw error;
  }
}
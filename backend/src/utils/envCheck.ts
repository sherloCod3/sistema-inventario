import { logger } from '../config/logger';

export function checkRequiredEnvVars() {
  const requiredVars = [];

  // Adicione a validação de DUCKDNS apenas se necessário
  if (process.env.USE_DUCKDNS === 'true') {
      requiredVars.push('DUCKDNS_DOMAIN', 'DUCKDNS_TOKEN');
  }

  const missingVars = requiredVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
      const error = `Missing required environment variables: ${missingVars.join(', ')}`;
      logger.error(error);
      throw new Error(error);
  }
}

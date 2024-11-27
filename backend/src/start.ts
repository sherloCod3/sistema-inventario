import dotenv from 'dotenv';
import { StartupService } from './services/startupService';
import { logger } from './config/logger';

dotenv.config();

async function main() {
  logger.info('🚀 Starting system...');
  
  try {
    const startup = new StartupService();
    await startup.start();
    logger.info('✅ System started successfully!');
  } catch (error) {
    logger.error('❌ System startup failed:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  logger.info('🛑 Received termination signal...');
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  logger.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

main().catch(error => {
  logger.error('❌ Fatal error:', error);
  process.exit(1);
});
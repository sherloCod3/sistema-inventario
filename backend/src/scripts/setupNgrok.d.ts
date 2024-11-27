// src/scripts/setupNgrok.ts
import axios from 'axios';
import { logger } from '../config/logger';

export async function getNgrokUrl(port: number): Promise<string | null> {
  try {
    const response = await axios.get('http://localhost:4040/api/tunnels');
    const tunnel = response.data.tunnels.find((t: any) => t.config.addr.includes(port.toString()));
    return tunnel?.public_url || null;
  } catch (error) {
    logger.error(`Erro ao obter URL do Ngrok para porta ${port}:`, error);
    return null;
  }
}
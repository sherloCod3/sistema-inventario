import { CorsOptions } from 'cors';
interface ServerConfig {
    port: number;
    nodeEnv: string;
    corsOptions: CorsOptions;
    allowedOrigins: string[];
}
declare const config: ServerConfig;
export default config;

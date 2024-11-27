export interface AppConfig {
    ports: {
        frontend: number;
        backend: number;
        ngrok: number;
    };
    mongodb: {
        uri: string;
    };
    jwt: {
        secret: string;
    };
    duckdns: {
        domain: string;
        token: string;
    };
    retries?: {
        maxAttempts: number;
        delay: number;
    };
}

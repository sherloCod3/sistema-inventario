// src/types/ngrok.ts
export interface NgrokUrls {
    frontend: string | null;
    backend: string | null;
  }
  
  export interface ProcessEvent {
    name: string;
    data?: string;
    error?: Error | string;
    code?: number;
  }
  
  export interface DuckDNSRecord {
    frontend: string;
    backend: string;
    updated_at: string;
    version: string;
  }
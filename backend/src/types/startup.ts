// src/types/startup.ts

export interface Colors {
  reset: string;
  blue: string;
  green: string;
  red: string;
  yellow: string;
  gray: string;
  cyan: string;
}

export interface Icons {
  START: string;
  SUCCESS: string;
  ERROR: string;
  WARNING: string;
  INFO: string;
  DATABASE: string;
  NETWORK: string;
  SERVER: string;
  CONFIG: string;
  CLEANUP: string;
  SECURITY: string;
  TIME: string;
}

export type LogType = 'success' | 'error' | 'warning' | 'info';

export interface ProcessConfig {
  command: string;
  args: string[];
  cwd?: string;
  name: string;
}

export interface StartupConfig {
  ports: {
    frontend: number;
    backend: number;
    ngrok: number;
  };
  timeouts: {
    startup: number;
    healthCheck: number;
    ngrokCheck: number;
  };
  retries: {
    maxAttempts: number;
    delay: number;
  };
}
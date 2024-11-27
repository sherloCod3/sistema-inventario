import { EventEmitter } from 'events';
import type { NgrokUrls as INgrokUrls } from '../types/ngrok';
declare class UrlManager extends EventEmitter {
    private static instance;
    private urls;
    private monitoringInterval;
    private readonly config;
    private constructor();
    static getInstance(): UrlManager;
    private retryOperation;
    private validateUrl;
    getActiveNgrokTunnels(): Promise<INgrokUrls>;
    private validateUrls;
    private updateDuckDNS;
    startUrlMonitoring(): Promise<void>;
    stopUrlMonitoring(): Promise<void>;
    getCurrentUrls(): INgrokUrls;
}
export default UrlManager;

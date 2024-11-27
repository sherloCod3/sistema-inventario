import { EventEmitter } from 'events';
import { AppConfig } from '../types/config';
export declare class StartupService extends EventEmitter {
    private config;
    private backendProcess;
    private frontendProcess;
    private ngrokProcess;
    private ngrokUrls;
    private duckDNSUpdateJob;
    private retries;
    constructor(config: AppConfig);
    start(): Promise<void>;
    private clearPorts;
    private startBackend;
    private startFrontend;
    private waitForService;
    private checkNgrokRunning;
    private startNgrok;
    private configureNgrokAndDuckDNS;
    private configureNgrok;
    private updateDuckDNS;
    private startPeriodicDuckDNSUpdate;
    private displayUrls;
    private getExecutablePath;
    private executeCommand;
    private retryOperation;
    private cleanup;
}
export default StartupService;

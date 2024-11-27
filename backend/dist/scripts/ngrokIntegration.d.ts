import { EventEmitter } from 'events';
declare class NgrokIntegration extends EventEmitter {
    private processes;
    private urlManager;
    constructor();
    killProcessOnPort(port: number): Promise<void>;
    private startProcess;
    startServices(): Promise<void>;
    stopServices(): Promise<void>;
    getProcessStatus(): Record<string, boolean>;
}
export default NgrokIntegration;

import { IPortScanner } from '../interfaces/IPortScanner';
import { PortEntry } from '../types';
export declare class PortScanner implements IPortScanner {
    private readonly projectDetector;
    private readonly processInspector;
    private readonly dockerResolver;
    private readonly frameworkRegistry;
    scan(devOnly: boolean): Promise<PortEntry[]>;
    /**
     * Resolves CPU%, RSS memory, uptime, and start time for all PIDs in one ps call.
     * Format: pid=%cpu=,rss=,etime=,lstart=
     */
    private resolveProcessStats;
    private formatCpu;
    private formatMemory;
    private parseEtime;
    /**
     * Resolves the full binary basename for each PID via a single ps call.
     */
    private resolveFullCommandNames;
    private fetchListeningPorts;
    private parseLsofLine;
    private buildEntry;
    private isDockerProcess;
    private isDevProcess;
}
//# sourceMappingURL=PortScanner.d.ts.map
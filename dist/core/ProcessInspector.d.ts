import { ProcessNode } from '../types';
interface ProcessStats {
    memory: string | null;
    uptime: string;
    startedAt: string | null;
}
export declare class ProcessInspector {
    /**
     * Returns memory (human-readable), uptime (human-readable), and start time for a PID.
     */
    getStats(pid: number): ProcessStats;
    /**
     * Walks up parent PIDs to build the ancestry chain.
     * Returns ordered from target → root.
     */
    getProcessTree(pid: number): ProcessNode[];
    private formatMemory;
    /**
     * Converts ps etime format to a human-readable string.
     * Formats: MM:SS | HH:MM:SS | DD-HH:MM:SS
     */
    private parseEtime;
}
export {};
//# sourceMappingURL=ProcessInspector.d.ts.map
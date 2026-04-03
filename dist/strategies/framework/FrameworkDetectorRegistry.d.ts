import { IFrameworkDetector } from '../../interfaces/IFrameworkDetector';
import { FrameworkInfo } from '../../types';
/**
 * Registry (Singleton) that holds all framework detectors and applies
 * the Strategy pattern: the first detector whose canDetect() returns true wins.
 *
 * Order matters — more specific detectors must come before generic ones.
 */
export declare class FrameworkDetectorRegistry {
    private static instance;
    private readonly detectors;
    private constructor();
    static getInstance(): FrameworkDetectorRegistry;
    /**
     * Registers a custom detector at the front of the chain (highest priority).
     */
    register(detector: IFrameworkDetector): void;
    /**
     * Returns the first matching FrameworkInfo or null if no detector matches.
     */
    resolve(processName: string, directory: string | null, containerName: string | null): FrameworkInfo | null;
}
//# sourceMappingURL=FrameworkDetectorRegistry.d.ts.map
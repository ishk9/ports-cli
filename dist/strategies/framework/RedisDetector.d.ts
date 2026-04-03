import { IFrameworkDetector } from '../../interfaces/IFrameworkDetector';
import { FrameworkInfo } from '../../types';
export declare class RedisDetector implements IFrameworkDetector {
    readonly detectorName = "Redis";
    canDetect(processName: string, _directory: string | null, containerName: string | null): boolean;
    detect(): FrameworkInfo;
}
//# sourceMappingURL=RedisDetector.d.ts.map
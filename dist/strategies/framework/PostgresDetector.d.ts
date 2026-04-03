import { IFrameworkDetector } from '../../interfaces/IFrameworkDetector';
import { FrameworkInfo } from '../../types';
export declare class PostgresDetector implements IFrameworkDetector {
    readonly detectorName = "PostgreSQL";
    canDetect(processName: string, _directory: string | null, containerName: string | null): boolean;
    detect(): FrameworkInfo;
}
//# sourceMappingURL=PostgresDetector.d.ts.map
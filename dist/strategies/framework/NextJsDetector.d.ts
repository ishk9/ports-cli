import { IFrameworkDetector } from '../../interfaces/IFrameworkDetector';
import { FrameworkInfo } from '../../types';
export declare class NextJsDetector implements IFrameworkDetector {
    readonly detectorName = "NextJs";
    canDetect(processName: string, directory: string | null): boolean;
    detect(): FrameworkInfo;
    private hasDependency;
}
//# sourceMappingURL=NextJsDetector.d.ts.map
import { IFrameworkDetector } from '../../interfaces/IFrameworkDetector';
import { FrameworkInfo } from '../../types';
export declare class ViteDetector implements IFrameworkDetector {
    readonly detectorName = "Vite";
    canDetect(_processName: string, directory: string | null): boolean;
    detect(): FrameworkInfo;
    private hasDependency;
}
//# sourceMappingURL=ViteDetector.d.ts.map
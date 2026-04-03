import { IFrameworkDetector } from '../../interfaces/IFrameworkDetector';
import { FrameworkInfo } from '../../types';
export declare class RubyDetector implements IFrameworkDetector {
    readonly detectorName = "Ruby";
    canDetect(processName: string, directory: string | null): boolean;
    detect(_processName: string, directory: string | null): FrameworkInfo;
}
//# sourceMappingURL=RubyDetector.d.ts.map
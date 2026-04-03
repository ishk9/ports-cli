import { IFrameworkDetector } from '../../interfaces/IFrameworkDetector';
import { FrameworkInfo } from '../../types';
export declare class PythonDetector implements IFrameworkDetector {
    readonly detectorName = "Python";
    canDetect(processName: string, directory: string | null): boolean;
    detect(processName: string, directory: string | null): FrameworkInfo;
    private hasFastAPI;
    private hasFlask;
    private requirementsContain;
}
//# sourceMappingURL=PythonDetector.d.ts.map
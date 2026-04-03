import { FrameworkInfo } from '../types';

export interface IFrameworkDetector {
  readonly detectorName: string;

  /**
   * Returns true if this detector can handle the given process/context.
   */
  canDetect(
    processName: string,
    directory: string | null,
    containerName: string | null,
  ): boolean;

  /**
   * Returns the resolved framework info. Only called when canDetect() is true.
   */
  detect(
    processName: string,
    directory: string | null,
    containerName: string | null,
  ): FrameworkInfo;
}

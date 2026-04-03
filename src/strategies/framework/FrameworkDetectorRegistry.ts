import { IFrameworkDetector } from '../../interfaces/IFrameworkDetector';
import { FrameworkInfo } from '../../types';
import { NextJsDetector } from './NextJsDetector';
import { ViteDetector } from './ViteDetector';
import { PostgresDetector } from './PostgresDetector';
import { RedisDetector } from './RedisDetector';
import { PythonDetector } from './PythonDetector';
import { RubyDetector } from './RubyDetector';

/**
 * Registry (Singleton) that holds all framework detectors and applies
 * the Strategy pattern: the first detector whose canDetect() returns true wins.
 *
 * Order matters — more specific detectors must come before generic ones.
 */
export class FrameworkDetectorRegistry {
  private static instance: FrameworkDetectorRegistry;
  private readonly detectors: IFrameworkDetector[];

  private constructor() {
    this.detectors = [
      new NextJsDetector(),
      new ViteDetector(),
      new PostgresDetector(),
      new RedisDetector(),
      new PythonDetector(),
      new RubyDetector(),
    ];
  }

  static getInstance(): FrameworkDetectorRegistry {
    if (!FrameworkDetectorRegistry.instance) {
      FrameworkDetectorRegistry.instance = new FrameworkDetectorRegistry();
    }
    return FrameworkDetectorRegistry.instance;
  }

  /**
   * Registers a custom detector at the front of the chain (highest priority).
   */
  register(detector: IFrameworkDetector): void {
    this.detectors.unshift(detector);
  }

  /**
   * Returns the first matching FrameworkInfo or null if no detector matches.
   */
  resolve(
    processName: string,
    directory: string | null,
    containerName: string | null,
  ): FrameworkInfo | null {
    for (const detector of this.detectors) {
      if (detector.canDetect(processName, directory, containerName)) {
        return detector.detect(processName, directory, containerName);
      }
    }
    return null;
  }
}

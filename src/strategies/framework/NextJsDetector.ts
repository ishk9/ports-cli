import * as fs from 'fs';
import * as path from 'path';
import { IFrameworkDetector } from '../../interfaces/IFrameworkDetector';
import { FrameworkInfo } from '../../types';

export class NextJsDetector implements IFrameworkDetector {
  readonly detectorName = 'NextJs';

  canDetect(
    processName: string,
    directory: string | null,
  ): boolean {
    if (processName === 'next-server' || processName === 'next') return true;
    if (!directory) return false;
    return this.hasDependency(directory, 'next');
  }

  detect(): FrameworkInfo {
    return { name: 'Next.js', color: 'cyan' };
  }

  private hasDependency(dir: string, dep: string): boolean {
    const pkgPath = path.join(dir, 'package.json');
    if (!fs.existsSync(pkgPath)) return false;
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return !!(pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]);
    } catch {
      return false;
    }
  }
}

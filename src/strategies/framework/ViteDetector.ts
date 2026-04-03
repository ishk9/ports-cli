import * as fs from 'fs';
import * as path from 'path';
import { IFrameworkDetector } from '../../interfaces/IFrameworkDetector';
import { FrameworkInfo } from '../../types';

export class ViteDetector implements IFrameworkDetector {
  readonly detectorName = 'Vite';

  canDetect(_processName: string, directory: string | null): boolean {
    if (!directory) return false;
    return (
      this.hasDependency(directory, 'vite') ||
      fs.existsSync(path.join(directory, 'vite.config.ts')) ||
      fs.existsSync(path.join(directory, 'vite.config.js'))
    );
  }

  detect(): FrameworkInfo {
    return { name: 'Vite', color: 'yellow' };
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

import * as fs from 'fs';
import * as path from 'path';
import { IFrameworkDetector } from '../../interfaces/IFrameworkDetector';
import { FrameworkInfo } from '../../types';

const RUBY_PROCESSES = new Set(['ruby', 'puma', 'thin', 'unicorn', 'rails']);

export class RubyDetector implements IFrameworkDetector {
  readonly detectorName = 'Ruby';

  canDetect(processName: string, directory: string | null): boolean {
    if (RUBY_PROCESSES.has(processName.toLowerCase())) return true;
    if (!directory) return false;
    return (
      fs.existsSync(path.join(directory, 'Gemfile')) ||
      fs.existsSync(path.join(directory, 'config', 'application.rb'))
    );
  }

  detect(_processName: string, directory: string | null): FrameworkInfo {
    if (directory && fs.existsSync(path.join(directory, 'config', 'application.rb'))) {
      return { name: 'Rails', color: 'red' };
    }
    return { name: 'Ruby', color: 'magenta' };
  }
}

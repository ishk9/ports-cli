import * as fs from 'fs';
import * as path from 'path';
import { IFrameworkDetector } from '../../interfaces/IFrameworkDetector';
import { FrameworkInfo } from '../../types';

const PYTHON_PROCESSES = new Set(['python', 'python3', 'uvicorn', 'gunicorn', 'flask', 'django']);

export class PythonDetector implements IFrameworkDetector {
  readonly detectorName = 'Python';

  canDetect(processName: string, directory: string | null): boolean {
    if (PYTHON_PROCESSES.has(processName.toLowerCase())) return true;
    if (!directory) return false;
    return (
      fs.existsSync(path.join(directory, 'manage.py')) ||
      fs.existsSync(path.join(directory, 'requirements.txt')) ||
      fs.existsSync(path.join(directory, 'pyproject.toml'))
    );
  }

  detect(processName: string, directory: string | null): FrameworkInfo {
    if (directory) {
      if (fs.existsSync(path.join(directory, 'manage.py'))) {
        return { name: 'Django', color: 'green' };
      }
      if (this.hasFastAPI(directory)) {
        return { name: 'FastAPI', color: 'green' };
      }
      if (this.hasFlask(directory)) {
        return { name: 'Flask', color: 'green' };
      }
    }

    if (processName === 'uvicorn') return { name: 'FastAPI', color: 'green' };
    if (processName === 'gunicorn') return { name: 'Gunicorn', color: 'green' };

    return { name: 'Python', color: 'yellow' };
  }

  private hasFastAPI(dir: string): boolean {
    return this.requirementsContain(dir, 'fastapi');
  }

  private hasFlask(dir: string): boolean {
    return this.requirementsContain(dir, 'flask');
  }

  private requirementsContain(dir: string, pkg: string): boolean {
    const reqPath = path.join(dir, 'requirements.txt');
    if (!fs.existsSync(reqPath)) return false;
    try {
      return fs.readFileSync(reqPath, 'utf8').toLowerCase().includes(pkg);
    } catch {
      return false;
    }
  }
}

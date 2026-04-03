import { IFrameworkDetector } from '../../interfaces/IFrameworkDetector';
import { FrameworkInfo } from '../../types';

const POSTGRES_PROCESSES = new Set(['postgres', 'postgresql', 'pg_ctl']);
const POSTGRES_CONTAINER_KEYWORDS = ['postgres', 'postgresql', 'pg'];

export class PostgresDetector implements IFrameworkDetector {
  readonly detectorName = 'PostgreSQL';

  canDetect(
    processName: string,
    _directory: string | null,
    containerName: string | null,
  ): boolean {
    if (POSTGRES_PROCESSES.has(processName.toLowerCase())) return true;
    if (containerName) {
      const lower = containerName.toLowerCase();
      return POSTGRES_CONTAINER_KEYWORDS.some((kw) => lower.includes(kw));
    }
    return false;
  }

  detect(): FrameworkInfo {
    return { name: 'PostgreSQL', color: 'blue' };
  }
}

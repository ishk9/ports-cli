import { IFrameworkDetector } from '../../interfaces/IFrameworkDetector';
import { FrameworkInfo } from '../../types';

const REDIS_PROCESSES = new Set(['redis-server', 'redis']);
const REDIS_CONTAINER_KEYWORDS = ['redis'];

export class RedisDetector implements IFrameworkDetector {
  readonly detectorName = 'Redis';

  canDetect(
    processName: string,
    _directory: string | null,
    containerName: string | null,
  ): boolean {
    if (REDIS_PROCESSES.has(processName.toLowerCase())) return true;
    if (containerName) {
      const lower = containerName.toLowerCase();
      return REDIS_CONTAINER_KEYWORDS.some((kw) => lower.includes(kw));
    }
    return false;
  }

  detect(): FrameworkInfo {
    return { name: 'Redis', color: 'red' };
  }
}

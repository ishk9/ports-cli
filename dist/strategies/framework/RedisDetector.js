"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisDetector = void 0;
const REDIS_PROCESSES = new Set(['redis-server', 'redis']);
const REDIS_CONTAINER_KEYWORDS = ['redis'];
class RedisDetector {
    constructor() {
        this.detectorName = 'Redis';
    }
    canDetect(processName, _directory, containerName) {
        if (REDIS_PROCESSES.has(processName.toLowerCase()))
            return true;
        if (containerName) {
            const lower = containerName.toLowerCase();
            return REDIS_CONTAINER_KEYWORDS.some((kw) => lower.includes(kw));
        }
        return false;
    }
    detect() {
        return { name: 'Redis', color: 'red' };
    }
}
exports.RedisDetector = RedisDetector;
//# sourceMappingURL=RedisDetector.js.map
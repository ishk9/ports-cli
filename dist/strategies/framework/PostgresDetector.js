"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresDetector = void 0;
const POSTGRES_PROCESSES = new Set(['postgres', 'postgresql', 'pg_ctl']);
const POSTGRES_CONTAINER_KEYWORDS = ['postgres', 'postgresql', 'pg'];
class PostgresDetector {
    constructor() {
        this.detectorName = 'PostgreSQL';
    }
    canDetect(processName, _directory, containerName) {
        if (POSTGRES_PROCESSES.has(processName.toLowerCase()))
            return true;
        if (containerName) {
            const lower = containerName.toLowerCase();
            return POSTGRES_CONTAINER_KEYWORDS.some((kw) => lower.includes(kw));
        }
        return false;
    }
    detect() {
        return { name: 'PostgreSQL', color: 'blue' };
    }
}
exports.PostgresDetector = PostgresDetector;
//# sourceMappingURL=PostgresDetector.js.map
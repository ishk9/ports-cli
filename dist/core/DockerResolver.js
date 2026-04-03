"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerResolver = void 0;
const child_process_1 = require("child_process");
/**
 * Resolves Docker container names for ports managed by Docker.
 * Uses a single `docker ps` call and caches the result.
 */
class DockerResolver {
    constructor() {
        this.cache = null;
    }
    /**
     * Returns the container name for a given port, or null if not a Docker container.
     */
    getContainerName(port) {
        const map = this.getPortToContainerMap();
        return map.get(port) ?? null;
    }
    getPortToContainerMap() {
        if (this.cache !== null)
            return this.cache;
        this.cache = new Map();
        try {
            const raw = (0, child_process_1.execSync)(`docker ps --format "{{.Names}}\\t{{.Ports}}" 2>/dev/null`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
            for (const line of raw.split('\n')) {
                const [name, portsStr] = line.split('\t');
                if (!name || !portsStr)
                    continue;
                for (const container of this.parseContainerPorts(name.trim(), portsStr.trim())) {
                    for (const p of container.ports) {
                        this.cache.set(p, container.name);
                    }
                }
            }
        }
        catch {
            // Docker not available or not running
        }
        return this.cache;
    }
    parseContainerPorts(name, portsStr) {
        const ports = [];
        // Matches: 0.0.0.0:5432->5432/tcp  or  :::6379->6379/tcp
        const regex = /(?:[\d.]+|::):(\d+)->/g;
        let match;
        while ((match = regex.exec(portsStr)) !== null) {
            ports.push(parseInt(match[1], 10));
        }
        return [{ name, ports }];
    }
}
exports.DockerResolver = DockerResolver;
//# sourceMappingURL=DockerResolver.js.map
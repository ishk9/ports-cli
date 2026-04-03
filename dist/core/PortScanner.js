"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortScanner = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const ProjectDetector_1 = require("./ProjectDetector");
const ProcessInspector_1 = require("./ProcessInspector");
const DockerResolver_1 = require("./DockerResolver");
const FrameworkDetectorRegistry_1 = require("../strategies/framework/FrameworkDetectorRegistry");
const DEV_PROCESSES = new Set([
    'node', 'next-server', 'next', 'deno', 'bun',
    'python', 'python3', 'uvicorn', 'gunicorn', 'flask',
    'ruby', 'puma', 'thin', 'unicorn', 'rails',
    'java', 'gradle', 'mvn', 'spring',
    'go', 'air',
    'php', 'artisan',
    'cargo', 'rust-analyzer',
    'docker', 'com.docker.backend',
    'postgres', 'postgresql', 'redis-server', 'mysqld', 'mongod',
    'webpack', 'vite', 'parcel', 'esbuild',
    'ollama',
]);
const DOCKER_PROCESS_PATTERNS = ['docker', 'com.docker'];
class PortScanner {
    constructor() {
        this.projectDetector = new ProjectDetector_1.ProjectDetector();
        this.processInspector = new ProcessInspector_1.ProcessInspector();
        this.dockerResolver = new DockerResolver_1.DockerResolver();
        this.frameworkRegistry = FrameworkDetectorRegistry_1.FrameworkDetectorRegistry.getInstance();
    }
    async scan(devOnly) {
        const rawRecords = this.fetchListeningPorts();
        if (rawRecords.length === 0)
            return [];
        const uniquePids = [...new Set(rawRecords.map((r) => r.pid))];
        // Three batched calls — avoid N individual ps/lsof invocations
        const fullCommandMap = this.resolveFullCommandNames(uniquePids);
        const statsMap = this.resolveProcessStats(uniquePids);
        const cwdMap = this.projectDetector.getCwdBatch(uniquePids);
        const enrichedRecords = rawRecords.map((r) => ({
            ...r,
            command: fullCommandMap.get(r.pid) ?? r.command,
        }));
        const entries = enrichedRecords
            .filter((r) => !devOnly || this.isDevProcess(r.command))
            .map((r) => this.buildEntry(r, cwdMap, statsMap));
        return entries.sort((a, b) => a.port - b.port);
    }
    /**
     * Resolves CPU%, RSS memory, uptime, and start time for all PIDs in one ps call.
     * Format: pid=%cpu=,rss=,etime=,lstart=
     */
    resolveProcessStats(pids) {
        const map = new Map();
        if (pids.length === 0)
            return map;
        try {
            const pidList = pids.join(',');
            // lstart is a long date string — must be last so etime stays parseable
            const raw = (0, child_process_1.execSync)(`ps -p ${pidList} -o pid=,%cpu=,rss=,etime=,lstart= 2>/dev/null`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
            for (const line of raw.split('\n')) {
                const trimmed = line.trim();
                if (!trimmed)
                    continue;
                const parts = trimmed.split(/\s+/);
                if (parts.length < 4)
                    continue;
                const pid = parseInt(parts[0], 10);
                const cpuRaw = parseFloat(parts[1]);
                const rssKb = parseInt(parts[2], 10);
                const etime = parts[3];
                // lstart is everything after the first 4 tokens
                const lstart = parts.slice(4).join(' ') || null;
                map.set(pid, {
                    cpu: this.formatCpu(cpuRaw),
                    memory: this.formatMemory(rssKb),
                    uptime: this.parseEtime(etime),
                    startedAt: lstart,
                });
            }
        }
        catch {
            // ps unavailable — entries will show '–'
        }
        return map;
    }
    formatCpu(pct) {
        return `${pct.toFixed(1)}%`;
    }
    formatMemory(rssKb) {
        if (rssKb >= 1024 * 1024)
            return `${(rssKb / 1024 / 1024).toFixed(1)} GB`;
        if (rssKb >= 1024)
            return `${(rssKb / 1024).toFixed(1)} MB`;
        return `${rssKb} KB`;
    }
    parseEtime(etime) {
        const dayMatch = etime.match(/^(\d+)-(\d+):(\d+):(\d+)$/);
        if (dayMatch) {
            const [, d, h, m] = dayMatch;
            return `${d}d ${h}h ${m}m`;
        }
        const parts = etime.split(':').map(Number);
        if (parts.length === 3) {
            const [h, m, s] = parts;
            if (h > 0)
                return `${h}h ${m}m`;
            return `${m}m ${s}s`;
        }
        if (parts.length === 2) {
            const [m, s] = parts;
            return `${m}m ${s}s`;
        }
        return etime;
    }
    /**
     * Resolves the full binary basename for each PID via a single ps call.
     */
    resolveFullCommandNames(pids) {
        const map = new Map();
        if (pids.length === 0)
            return map;
        try {
            const pidList = pids.join(',');
            const raw = (0, child_process_1.execSync)(`ps -p ${pidList} -o pid=,comm= 2>/dev/null`, {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            for (const line of raw.split('\n')) {
                const trimmed = line.trim();
                if (!trimmed)
                    continue;
                const spaceIdx = trimmed.indexOf(' ');
                if (spaceIdx === -1)
                    continue;
                const pid = parseInt(trimmed.slice(0, spaceIdx), 10);
                const fullPath = trimmed.slice(spaceIdx + 1).trim();
                // Use just the basename of the full path
                map.set(pid, path.basename(fullPath));
            }
        }
        catch {
            // ps failed — fall back to lsof names
        }
        return map;
    }
    fetchListeningPorts() {
        try {
            const raw = (0, child_process_1.execSync)('lsof -iTCP -sTCP:LISTEN -P -n 2>/dev/null', {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            const seen = new Set();
            const records = [];
            for (const line of raw.split('\n').slice(1)) {
                const parsed = this.parseLsofLine(line);
                if (!parsed)
                    continue;
                const key = `${parsed.pid}:${parsed.port}`;
                if (seen.has(key))
                    continue;
                seen.add(key);
                records.push(parsed);
            }
            return records;
        }
        catch {
            return [];
        }
    }
    parseLsofLine(line) {
        if (!line.trim())
            return null;
        const match = line.match(/^(\S+)\s+(\d+)\s+\S+\s+\S+\s+\S+\s+\S+\s+\S+\s+\S+\s+.*?:(\d+)\s*/);
        if (!match)
            return null;
        return {
            command: match[1],
            pid: parseInt(match[2], 10),
            port: parseInt(match[3], 10),
        };
    }
    buildEntry(record, cwdMap, statsMap) {
        const isDocker = this.isDockerProcess(record.command);
        const containerName = isDocker
            ? this.dockerResolver.getContainerName(record.port)
            : null;
        const cwd = isDocker ? null : (cwdMap.get(record.pid) ?? null);
        const projectInfo = this.projectDetector.resolve(cwd);
        const stats = statsMap.get(record.pid) ?? {
            cpu: '–', memory: '–', uptime: '–', startedAt: null,
        };
        const framework = this.frameworkRegistry.resolve(record.command, projectInfo.directory, containerName);
        const project = containerName ?? projectInfo.project;
        const displayCommand = isDocker ? 'docker' : record.command;
        return {
            port: record.port,
            process: displayCommand,
            pid: record.pid,
            project,
            framework,
            cpu: stats.cpu,
            memory: stats.memory,
            uptime: stats.uptime,
            status: 'healthy',
            directory: projectInfo.directory,
            gitBranch: projectInfo.gitBranch,
            startedAt: stats.startedAt,
            isDevServer: this.isDevProcess(record.command),
        };
    }
    isDockerProcess(command) {
        const lower = command.toLowerCase();
        return DOCKER_PROCESS_PATTERNS.some((p) => lower.includes(p));
    }
    isDevProcess(command) {
        const lower = command.toLowerCase();
        // Strip version suffixes like "next-server (v16.1.6)" → "next-server"
        const baseName = lower.split(/[\s(]/)[0];
        if (DEV_PROCESSES.has(lower) || DEV_PROCESSES.has(baseName))
            return true;
        if (this.isDockerProcess(lower))
            return true;
        return false;
    }
}
exports.PortScanner = PortScanner;
//# sourceMappingURL=PortScanner.js.map
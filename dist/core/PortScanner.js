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
        // Resolve full command names once (lsof truncates to 9 chars)
        const fullCommandMap = this.resolveFullCommandNames(uniquePids);
        // Apply full command names to records
        const enrichedRecords = rawRecords.map((r) => ({
            ...r,
            command: fullCommandMap.get(r.pid) ?? r.command,
        }));
        const cwdMap = this.projectDetector.getCwdBatch(uniquePids);
        const entries = enrichedRecords
            .filter((r) => !devOnly || this.isDevProcess(r.command))
            .map((r) => this.buildEntry(r, cwdMap));
        return entries.sort((a, b) => a.port - b.port);
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
    buildEntry(record, cwdMap) {
        const isDocker = this.isDockerProcess(record.command);
        // For Docker processes, skip cwd-based project detection;
        // use the container name as project instead.
        const containerName = isDocker
            ? this.dockerResolver.getContainerName(record.port)
            : null;
        const cwd = isDocker ? null : (cwdMap.get(record.pid) ?? null);
        const projectInfo = this.projectDetector.resolve(cwd);
        const stats = this.processInspector.getStats(record.pid);
        const framework = this.frameworkRegistry.resolve(record.command, projectInfo.directory, containerName);
        const project = containerName ?? projectInfo.project;
        // Display-friendly process name: for Docker, show "docker"
        const displayCommand = isDocker ? 'docker' : record.command;
        return {
            port: record.port,
            process: displayCommand,
            pid: record.pid,
            project,
            framework,
            uptime: stats.uptime,
            status: 'healthy',
            directory: projectInfo.directory,
            gitBranch: projectInfo.gitBranch,
            memory: stats.memory,
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
        if (DEV_PROCESSES.has(lower))
            return true;
        if (this.isDockerProcess(lower))
            return true;
        return false;
    }
}
exports.PortScanner = PortScanner;
//# sourceMappingURL=PortScanner.js.map
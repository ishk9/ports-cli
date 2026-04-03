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
exports.ProcessInspector = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
class ProcessInspector {
    /**
     * Returns memory (human-readable), uptime (human-readable), and start time for a PID.
     */
    getStats(pid) {
        try {
            const raw = (0, child_process_1.execSync)(`ps -p ${pid} -o rss=,etime=,lstart= 2>/dev/null`, {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe'],
            }).trim();
            if (!raw)
                return { memory: null, uptime: '–', startedAt: null };
            // lstart is a long date string at the end; etime and rss are first two tokens
            // Format: "  62000  21:11 Thu Apr  2 20:51:24 2026"
            const match = raw.match(/^\s*(\d+)\s+([0-9:\-]+)\s+(.+)$/);
            if (!match)
                return { memory: null, uptime: '–', startedAt: null };
            const rssKb = parseInt(match[1], 10);
            const etimeRaw = match[2].trim();
            const lstartRaw = match[3].trim();
            return {
                memory: this.formatMemory(rssKb),
                uptime: this.parseEtime(etimeRaw),
                startedAt: lstartRaw || null,
            };
        }
        catch {
            return { memory: null, uptime: '–', startedAt: null };
        }
    }
    /**
     * Walks up parent PIDs to build the ancestry chain.
     * Returns ordered from target → root.
     */
    getProcessTree(pid) {
        const chain = [];
        let current = pid;
        const visited = new Set();
        while (current > 1 && !visited.has(current)) {
            visited.add(current);
            try {
                const raw = (0, child_process_1.execSync)(`ps -p ${current} -o pid=,ppid=,comm= 2>/dev/null`, {
                    encoding: 'utf8',
                    stdio: ['pipe', 'pipe', 'pipe'],
                }).trim();
                if (!raw)
                    break;
                const parts = raw.trim().split(/\s+/);
                if (parts.length < 3)
                    break;
                const nodePid = parseInt(parts[0], 10);
                const ppid = parseInt(parts[1], 10);
                const rawCommand = parts.slice(2).join(' ');
                // Use basename to strip long absolute paths
                const command = path.basename(rawCommand);
                chain.push({ pid: nodePid, command, ppid });
                current = ppid;
            }
            catch {
                break;
            }
        }
        return chain;
    }
    formatMemory(rssKb) {
        if (rssKb >= 1024 * 1024) {
            return `${(rssKb / 1024 / 1024).toFixed(1)} GB`;
        }
        if (rssKb >= 1024) {
            return `${(rssKb / 1024).toFixed(1)} MB`;
        }
        return `${rssKb} KB`;
    }
    /**
     * Converts ps etime format to a human-readable string.
     * Formats: MM:SS | HH:MM:SS | DD-HH:MM:SS
     */
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
}
exports.ProcessInspector = ProcessInspector;
//# sourceMappingURL=ProcessInspector.js.map
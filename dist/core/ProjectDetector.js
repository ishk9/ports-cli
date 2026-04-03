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
exports.ProjectDetector = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class ProjectDetector {
    /**
     * Resolves the working directory of a process using lsof.
     * Batches multiple PIDs in a single lsof call for performance.
     */
    getCwdBatch(pids) {
        const result = new Map();
        if (pids.length === 0)
            return result;
        try {
            const pidList = pids.join(',');
            const raw = (0, child_process_1.execSync)(`lsof -p ${pidList} -a -d cwd -F pn 2>/dev/null`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
            let currentPid = null;
            for (const line of raw.split('\n')) {
                if (line.startsWith('p')) {
                    currentPid = parseInt(line.slice(1), 10);
                }
                else if (line.startsWith('n') && currentPid !== null) {
                    result.set(currentPid, line.slice(1));
                }
            }
        }
        catch {
            // lsof unavailable or permission denied — gracefully degrade
        }
        return result;
    }
    /**
     * Enriches a cwd path with project name, git branch, and package version.
     */
    resolve(cwd) {
        if (!cwd) {
            return { directory: null, project: null, gitBranch: null, version: null };
        }
        const project = this.detectProjectName(cwd);
        const gitBranch = this.getGitBranch(cwd);
        const version = this.getPackageVersion(cwd);
        return { directory: cwd, project, gitBranch, version };
    }
    detectProjectName(cwd) {
        // Prefer package.json name, fall back to directory basename
        const pkgPath = path.join(cwd, 'package.json');
        if (fs.existsSync(pkgPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                if (typeof pkg.name === 'string' && pkg.name.trim()) {
                    return pkg.name.trim();
                }
            }
            catch {
                // malformed package.json
            }
        }
        return path.basename(cwd) || null;
    }
    getGitBranch(cwd) {
        try {
            const branch = (0, child_process_1.execSync)(`git -C "${cwd}" branch --show-current 2>/dev/null`, {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe'],
            }).trim();
            return branch || null;
        }
        catch {
            return null;
        }
    }
    getPackageVersion(cwd) {
        const pkgPath = path.join(cwd, 'package.json');
        if (!fs.existsSync(pkgPath))
            return null;
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            return typeof pkg.version === 'string' ? pkg.version : null;
        }
        catch {
            return null;
        }
    }
}
exports.ProjectDetector = ProjectDetector;
//# sourceMappingURL=ProjectDetector.js.map
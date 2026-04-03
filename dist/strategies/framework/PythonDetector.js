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
exports.PythonDetector = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PYTHON_PROCESSES = new Set(['python', 'python3', 'uvicorn', 'gunicorn', 'flask', 'django']);
class PythonDetector {
    constructor() {
        this.detectorName = 'Python';
    }
    canDetect(processName, directory) {
        if (PYTHON_PROCESSES.has(processName.toLowerCase()))
            return true;
        if (!directory)
            return false;
        return (fs.existsSync(path.join(directory, 'manage.py')) ||
            fs.existsSync(path.join(directory, 'requirements.txt')) ||
            fs.existsSync(path.join(directory, 'pyproject.toml')));
    }
    detect(processName, directory) {
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
        if (processName === 'uvicorn')
            return { name: 'FastAPI', color: 'green' };
        if (processName === 'gunicorn')
            return { name: 'Gunicorn', color: 'green' };
        return { name: 'Python', color: 'yellow' };
    }
    hasFastAPI(dir) {
        return this.requirementsContain(dir, 'fastapi');
    }
    hasFlask(dir) {
        return this.requirementsContain(dir, 'flask');
    }
    requirementsContain(dir, pkg) {
        const reqPath = path.join(dir, 'requirements.txt');
        if (!fs.existsSync(reqPath))
            return false;
        try {
            return fs.readFileSync(reqPath, 'utf8').toLowerCase().includes(pkg);
        }
        catch {
            return false;
        }
    }
}
exports.PythonDetector = PythonDetector;
//# sourceMappingURL=PythonDetector.js.map
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
exports.NextJsDetector = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class NextJsDetector {
    constructor() {
        this.detectorName = 'NextJs';
    }
    canDetect(processName, directory) {
        if (processName === 'next-server' || processName === 'next')
            return true;
        if (!directory)
            return false;
        return this.hasDependency(directory, 'next');
    }
    detect() {
        return { name: 'Next.js', color: 'cyan' };
    }
    hasDependency(dir, dep) {
        const pkgPath = path.join(dir, 'package.json');
        if (!fs.existsSync(pkgPath))
            return false;
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            return !!(pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]);
        }
        catch {
            return false;
        }
    }
}
exports.NextJsDetector = NextJsDetector;
//# sourceMappingURL=NextJsDetector.js.map
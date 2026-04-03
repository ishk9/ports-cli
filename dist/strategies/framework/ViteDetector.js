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
exports.ViteDetector = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ViteDetector {
    constructor() {
        this.detectorName = 'Vite';
    }
    canDetect(_processName, directory) {
        if (!directory)
            return false;
        return (this.hasDependency(directory, 'vite') ||
            fs.existsSync(path.join(directory, 'vite.config.ts')) ||
            fs.existsSync(path.join(directory, 'vite.config.js')));
    }
    detect() {
        return { name: 'Vite', color: 'yellow' };
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
exports.ViteDetector = ViteDetector;
//# sourceMappingURL=ViteDetector.js.map
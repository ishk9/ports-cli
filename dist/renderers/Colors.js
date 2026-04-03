"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Colors = void 0;
const chalk_1 = __importDefault(require("chalk"));
/**
 * Centralized color definitions — single place to change the entire palette.
 */
exports.Colors = {
    port: chalk_1.default.yellow,
    process: chalk_1.default.white,
    pid: chalk_1.default.gray,
    project: chalk_1.default.magenta,
    uptime: chalk_1.default.green,
    statusHealthy: chalk_1.default.green,
    statusUnhealthy: chalk_1.default.red,
    header: chalk_1.default.cyan.bold,
    dim: chalk_1.default.dim,
    success: chalk_1.default.green.bold,
    error: chalk_1.default.red.bold,
    prompt: chalk_1.default.yellow,
    killCommand: chalk_1.default.cyan,
    killPid: chalk_1.default.red,
    sectionLabel: chalk_1.default.dim,
    treeGlyph: chalk_1.default.gray,
    memory: chalk_1.default.green,
    directory: chalk_1.default.magenta,
    watching: chalk_1.default.dim,
    newPort: chalk_1.default.green.bold,
    removedPort: chalk_1.default.red.bold,
    brand: chalk_1.default.cyan.bold,
    tagline: chalk_1.default.dim,
    framework(color) {
        const map = {
            cyan: chalk_1.default.cyan,
            blue: chalk_1.default.blue,
            red: chalk_1.default.red,
            green: chalk_1.default.green,
            magenta: chalk_1.default.magenta,
            yellow: chalk_1.default.yellow,
            white: chalk_1.default.white,
        };
        return map[color] ?? chalk_1.default.white;
    },
};
//# sourceMappingURL=Colors.js.map
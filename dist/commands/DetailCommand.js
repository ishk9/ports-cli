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
exports.DetailCommand = void 0;
const readline = __importStar(require("readline"));
const PortScanner_1 = require("../core/PortScanner");
const ProcessInspector_1 = require("../core/ProcessInspector");
const DetailRenderer_1 = require("../renderers/DetailRenderer");
const Colors_1 = require("../renderers/Colors");
const child_process_1 = require("child_process");
/**
 * Handles `ports <number>` — shows details for a specific port and offers a kill prompt.
 */
class DetailCommand {
    constructor(port, scanner) {
        this.port = port;
        this.scanner = scanner ?? new PortScanner_1.PortScanner();
        this.inspector = new ProcessInspector_1.ProcessInspector();
        this.renderer = new DetailRenderer_1.DetailRenderer();
    }
    async execute() {
        const entries = await this.scanner.scan(false);
        const entry = entries.find((e) => e.port === this.port);
        if (!entry) {
            console.log(`\n  ${Colors_1.Colors.error(`No process found on port :${this.port}`)}\n`);
            return;
        }
        const tree = this.inspector.getProcessTree(entry.pid);
        console.log(this.renderer.render({ entry, tree }));
        const kill = await this.promptKill(this.port);
        if (kill) {
            this.killProcess(entry.pid, this.port);
        }
    }
    promptKill(port) {
        return new Promise((resolve) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question(`  ${Colors_1.Colors.prompt(`Kill process on :${port}? [y/N]`)} `, (answer) => {
                rl.close();
                resolve(answer.trim().toLowerCase() === 'y');
            });
        });
    }
    killProcess(pid, port) {
        try {
            (0, child_process_1.execSync)(`kill ${pid} 2>/dev/null`, { stdio: 'pipe' });
            console.log(`\n  ${Colors_1.Colors.success('✓')} Killed ${Colors_1.Colors.port(`:${port}`)} (PID ${Colors_1.Colors.pid(String(pid))})\n`);
        }
        catch {
            try {
                (0, child_process_1.execSync)(`kill -9 ${pid} 2>/dev/null`, { stdio: 'pipe' });
                console.log(`\n  ${Colors_1.Colors.success('✓')} Killed ${Colors_1.Colors.port(`:${port}`)} (PID ${Colors_1.Colors.pid(String(pid))})\n`);
            }
            catch {
                console.log(`\n  ${Colors_1.Colors.error('✗')} Failed to kill PID ${pid}. Try: ${Colors_1.Colors.killPid(`sudo kill ${pid}`)}\n`);
            }
        }
    }
}
exports.DetailCommand = DetailCommand;
//# sourceMappingURL=DetailCommand.js.map
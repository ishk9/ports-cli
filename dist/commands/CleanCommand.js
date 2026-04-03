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
exports.CleanCommand = void 0;
const readline = __importStar(require("readline"));
const child_process_1 = require("child_process");
const PortScanner_1 = require("../core/PortScanner");
const OrphanDetector_1 = require("../core/OrphanDetector");
const CleanRenderer_1 = require("../renderers/CleanRenderer");
const TableRenderer_1 = require("../renderers/TableRenderer");
const Colors_1 = require("../renderers/Colors");
/**
 * Handles `ports clean` and `ports clean <number>`.
 */
class CleanCommand {
    constructor(options = {}, scanner) {
        this.options = options;
        this.scanner = scanner ?? new PortScanner_1.PortScanner();
        this.orphanDetector = new OrphanDetector_1.OrphanDetector();
        this.cleanRenderer = new CleanRenderer_1.CleanRenderer();
        this.tableRenderer = new TableRenderer_1.TableRenderer();
    }
    async execute() {
        if (this.options.targetPort !== undefined) {
            await this.killSpecificPort(this.options.targetPort);
        }
        else {
            await this.killOrphans();
        }
    }
    async killSpecificPort(port) {
        const entries = await this.scanner.scan(false);
        const entry = entries.find((e) => e.port === port);
        if (!entry) {
            console.log(`\n  ${Colors_1.Colors.error(`No process found on port :${port}`)}\n`);
            return;
        }
        console.log('\n' + this.tableRenderer.render([entry]));
        console.log('');
        const confirmed = await this.prompt(`  ${Colors_1.Colors.prompt(`Kill process on :${port}? [y/N]`)} `);
        if (confirmed) {
            this.kill(entry);
            console.log(this.cleanRenderer.renderKillResult([{ port: entry.port, pid: entry.pid }]));
        }
        else {
            console.log(`\n  ${Colors_1.Colors.dim('Aborted.')}\n`);
        }
    }
    async killOrphans() {
        const entries = await this.scanner.scan(false);
        const orphans = this.orphanDetector.detect(entries);
        process.stdout.write(this.cleanRenderer.render(orphans));
        if (orphans.length === 0)
            return;
        const confirmed = await this.prompt(`  ${Colors_1.Colors.prompt('Kill all? [y/N]')} `);
        if (!confirmed) {
            console.log(`\n  ${Colors_1.Colors.dim('Aborted.')}\n`);
            return;
        }
        const killed = [];
        for (const orphan of orphans) {
            try {
                this.kill(orphan);
                killed.push({ port: orphan.port, pid: orphan.pid });
            }
            catch {
                console.log(`  ${Colors_1.Colors.error('✗')} Failed to kill :${orphan.port} (PID ${orphan.pid})`);
            }
        }
        console.log(this.cleanRenderer.renderKillResult(killed));
    }
    kill(entry) {
        try {
            (0, child_process_1.execSync)(`kill ${entry.pid} 2>/dev/null`, { stdio: 'pipe' });
        }
        catch {
            (0, child_process_1.execSync)(`kill -9 ${entry.pid} 2>/dev/null`, { stdio: 'pipe' });
        }
    }
    prompt(question) {
        return new Promise((resolve) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer.trim().toLowerCase() === 'y');
            });
        });
    }
}
exports.CleanCommand = CleanCommand;
//# sourceMappingURL=CleanCommand.js.map
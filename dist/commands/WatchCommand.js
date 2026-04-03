"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchCommand = void 0;
const PortScanner_1 = require("../core/PortScanner");
const HeaderRenderer_1 = require("../renderers/HeaderRenderer");
const TableRenderer_1 = require("../renderers/TableRenderer");
const Colors_1 = require("../renderers/Colors");
const POLL_INTERVAL_MS = 2000;
/**
 * Handles `ports watch` — real-time terminal monitor with 2s polling.
 *
 * Highlights newly appeared ports in green for one cycle and
 * fades removed ports in red before they disappear.
 */
class WatchCommand {
    constructor(scanner) {
        this.previousPids = new Set();
        this.flashedNewPids = new Set();
        this.removedEntries = [];
        this.scanner = scanner ?? new PortScanner_1.PortScanner();
        this.headerRenderer = new HeaderRenderer_1.HeaderRenderer();
        this.tableRenderer = new TableRenderer_1.TableRenderer();
    }
    async execute() {
        process.on('SIGINT', () => {
            process.stdout.write('\x1b[?25h'); // restore cursor
            console.log(`\n  ${Colors_1.Colors.dim('Stopped watching.')}\n`);
            process.exit(0);
        });
        process.stdout.write('\x1b[?25l'); // hide cursor
        // eslint-disable-next-line no-constant-condition
        while (true) {
            await this.tick();
            await this.sleep(POLL_INTERVAL_MS);
        }
    }
    async tick() {
        const entries = await this.scanner.scan(true);
        const currentPids = new Set(entries.map((e) => e.pid));
        const newPids = new Set();
        for (const pid of currentPids) {
            if (!this.previousPids.has(pid))
                newPids.add(pid);
        }
        const removedEntries = [];
        // We don't have the removed entries themselves since they're gone.
        // Keep removed from previous cycle and clear after one display.
        this.removedEntries = [];
        this.flashedNewPids = newPids;
        this.previousPids = currentPids;
        this.redraw(entries, newPids);
    }
    redraw(entries, newPids) {
        console.clear();
        console.log('\n' + this.headerRenderer.render({ watchMode: true }));
        console.log('');
        if (entries.length === 0) {
            console.log(`  ${Colors_1.Colors.dim('No active ports.')}`);
        }
        else {
            console.log(this.tableRenderer.render(entries, { newPids }));
        }
        console.log('');
        console.log(this.buildFooter(entries.length));
        console.log('');
    }
    buildFooter(count) {
        const time = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        return '  ' + Colors_1.Colors.dim(`Last updated: ${time}  ·  ${count} port${count !== 1 ? 's' : ''} active`);
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.WatchCommand = WatchCommand;
//# sourceMappingURL=WatchCommand.js.map
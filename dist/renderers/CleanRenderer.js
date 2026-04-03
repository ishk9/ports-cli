"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanRenderer = void 0;
const Colors_1 = require("./Colors");
/**
 * Renders the orphan list table used by `ports clean`.
 */
class CleanRenderer {
    render(orphans) {
        if (orphans.length === 0) {
            return `\n  ${Colors_1.Colors.success('✓')} ${Colors_1.Colors.dim('No orphaned ports found.')}\n`;
        }
        const portW = Math.max(6, ...orphans.map((o) => `:${o.port}`.length)) + 2;
        const procW = Math.max(9, ...orphans.map((o) => o.process.length)) + 2;
        const pidW = Math.max(5, ...orphans.map((o) => String(o.pid).length)) + 2;
        const reasonW = Math.max(8, ...orphans.map((o) => o.orphanReason.length)) + 2;
        const header = [
            Colors_1.Colors.header('PORT'.padEnd(portW)),
            Colors_1.Colors.header('PROCESS'.padEnd(procW)),
            Colors_1.Colors.header('PID'.padEnd(pidW)),
            Colors_1.Colors.header('REASON'.padEnd(reasonW)),
        ].join('');
        const rows = orphans.map((o) => {
            return [
                Colors_1.Colors.port(`:${o.port}`.padEnd(portW)),
                Colors_1.Colors.process(o.process.padEnd(procW)),
                Colors_1.Colors.pid(String(o.pid).padEnd(pidW)),
                Colors_1.Colors.dim(o.orphanReason.padEnd(reasonW)),
            ].join('');
        });
        const lines = [
            '',
            `  ${Colors_1.Colors.dim('Scanning for orphaned ports...')}`,
            '',
            `  ${Colors_1.Colors.error(`Found ${orphans.length} orphaned port${orphans.length !== 1 ? 's' : ''}:`)}`,
            '',
            `  ${header}`,
            ...rows.map((r) => `  ${r}`),
            '',
        ];
        return lines.join('\n');
    }
    renderKillResult(killed) {
        const lines = [''];
        for (const k of killed) {
            lines.push(`  ${Colors_1.Colors.success('✓')} Killed ${Colors_1.Colors.port(`:${k.port}`)} (PID ${Colors_1.Colors.pid(String(k.pid))})`);
        }
        lines.push('');
        lines.push(`  ${Colors_1.Colors.dim(`${killed.length} port${killed.length !== 1 ? 's' : ''} cleaned.`)}`);
        lines.push('');
        return lines.join('\n');
    }
    renderNoneFound() {
        return `\n  ${Colors_1.Colors.success('✓')} ${Colors_1.Colors.dim('No orphaned ports found.')}\n`;
    }
}
exports.CleanRenderer = CleanRenderer;
//# sourceMappingURL=CleanRenderer.js.map
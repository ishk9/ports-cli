"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableRenderer = void 0;
const Colors_1 = require("./Colors");
const COLS = {
    port: { header: 'PORT', min: 8 },
    process: { header: 'PROCESS', min: 10 },
    pid: { header: 'PID', min: 8 },
    project: { header: 'PROJECT', min: 20 },
    framework: { header: 'FRAMEWORK', min: 12 },
    cpu: { header: 'CPU', min: 8 },
    memory: { header: 'MEM', min: 10 },
    uptime: { header: 'UPTIME', min: 10 },
    status: { header: 'STATUS', min: 10 },
};
/**
 * Renders the main port table. Calculates dynamic column widths based on content.
 */
class TableRenderer {
    render(entries, options = {}) {
        const allEntries = [
            ...(options.removedEntries ?? []),
            ...entries,
        ];
        const widths = this.calculateWidths(allEntries);
        const lines = [];
        lines.push(this.renderHeader(widths));
        for (const entry of options.removedEntries ?? []) {
            lines.push(this.renderRow(entry, widths, 'removed'));
        }
        for (const entry of entries) {
            const isNew = options.newPids?.has(entry.pid);
            lines.push(this.renderRow(entry, widths, isNew ? 'new' : 'normal'));
        }
        return lines.join('\n');
    }
    calculateWidths(entries) {
        const widths = {
            port: COLS.port.min,
            process: COLS.process.min,
            pid: COLS.pid.min,
            project: COLS.project.min,
            framework: COLS.framework.min,
            cpu: COLS.cpu.min,
            memory: COLS.memory.min,
            uptime: COLS.uptime.min,
            status: COLS.status.min,
        };
        for (const e of entries) {
            widths.port = Math.max(widths.port, `:${e.port}`.length + 2);
            widths.process = Math.max(widths.process, e.process.length + 2);
            widths.pid = Math.max(widths.pid, String(e.pid).length + 2);
            widths.project = Math.max(widths.project, (e.project ?? '–').length + 2);
            widths.framework = Math.max(widths.framework, (e.framework?.name ?? '–').length + 2);
            widths.cpu = Math.max(widths.cpu, e.cpu.length + 2);
            widths.memory = Math.max(widths.memory, e.memory.length + 2);
            widths.uptime = Math.max(widths.uptime, e.uptime.length + 2);
        }
        return widths;
    }
    renderHeader(widths) {
        const cols = ['port', 'process', 'pid', 'project', 'framework', 'cpu', 'memory', 'uptime', 'status'];
        const parts = cols.map((k) => Colors_1.Colors.header(COLS[k].header.padEnd(widths[k])));
        return '  ' + parts.join('');
    }
    renderRow(entry, widths, highlight) {
        const portStr = `:${entry.port}`;
        const processStr = entry.process;
        const pidStr = String(entry.pid);
        const projectStr = entry.project ?? '–';
        const frameworkStr = entry.framework?.name ?? '–';
        const cpuStr = entry.cpu;
        const memStr = entry.memory;
        const uptimeStr = entry.uptime;
        const statusStr = `● ${entry.status}`;
        // Pad raw strings first, then colorize — avoids ANSI code length confusion
        const coloredCells = [
            Colors_1.Colors.port(portStr.padEnd(widths.port)),
            Colors_1.Colors.process(processStr.padEnd(widths.process)),
            Colors_1.Colors.pid(pidStr.padEnd(widths.pid)),
            entry.project
                ? Colors_1.Colors.project(projectStr.padEnd(widths.project))
                : Colors_1.Colors.dim(projectStr.padEnd(widths.project)),
            entry.framework
                ? Colors_1.Colors.framework(entry.framework.color)(frameworkStr.padEnd(widths.framework))
                : Colors_1.Colors.dim(frameworkStr.padEnd(widths.framework)),
            Colors_1.Colors.cpu(cpuStr.padEnd(widths.cpu)),
            Colors_1.Colors.memory(memStr.padEnd(widths.memory)),
            Colors_1.Colors.uptime(uptimeStr.padEnd(widths.uptime)),
            entry.status === 'healthy'
                ? Colors_1.Colors.statusHealthy(statusStr)
                : Colors_1.Colors.statusUnhealthy(statusStr),
        ];
        const row = '  ' + coloredCells.join('');
        if (highlight === 'new')
            return Colors_1.Colors.newPort(row);
        if (highlight === 'removed')
            return Colors_1.Colors.removedPort(row);
        return row;
    }
}
exports.TableRenderer = TableRenderer;
//# sourceMappingURL=TableRenderer.js.map
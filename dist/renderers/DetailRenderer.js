"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetailRenderer = void 0;
const Colors_1 = require("./Colors");
/**
 * Renders the detail view for a single port (ports <number>).
 */
class DetailRenderer {
    render(data) {
        const { entry, tree } = data;
        const lines = [''];
        lines.push(...this.renderFields(entry));
        lines.push('');
        lines.push(...this.renderSection('Location'));
        lines.push(...this.renderLocation(entry));
        lines.push('');
        lines.push(...this.renderSection('Process Tree'));
        lines.push(...this.renderTree(tree));
        lines.push('');
        lines.push(this.renderKillHint(entry));
        lines.push('');
        return lines.join('\n');
    }
    renderFields(entry) {
        const label = (s) => Colors_1.Colors.sectionLabel(s.padEnd(14));
        const val = (s) => s;
        const statusVal = entry.status === 'healthy'
            ? Colors_1.Colors.statusHealthy(`● ${entry.status}`)
            : Colors_1.Colors.statusUnhealthy(`● ${entry.status}`);
        const frameworkVal = entry.framework
            ? Colors_1.Colors.framework(entry.framework.color)(entry.framework.name)
            : Colors_1.Colors.dim('–');
        return [
            `  ${label('Process')}${val(entry.process)}`,
            `  ${label('PID')}${Colors_1.Colors.pid(String(entry.pid))}`,
            `  ${label('Status')}${statusVal}`,
            `  ${label('Framework')}${frameworkVal}`,
            `  ${label('Memory')}${entry.memory ? Colors_1.Colors.memory(entry.memory) : Colors_1.Colors.dim('–')}`,
            `  ${label('Uptime')}${Colors_1.Colors.uptime(entry.uptime)}`,
            `  ${label('Started')}${entry.startedAt ? Colors_1.Colors.dim(entry.startedAt) : Colors_1.Colors.dim('–')}`,
        ];
    }
    renderSection(title) {
        const dashes = Colors_1.Colors.dim('─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─');
        return [`  ${Colors_1.Colors.sectionLabel(title.padEnd(14))}${dashes}`];
    }
    renderLocation(entry) {
        const label = (s) => Colors_1.Colors.sectionLabel(s.padEnd(14));
        return [
            `  ${label('Directory')}${entry.directory ? Colors_1.Colors.directory(entry.directory) : Colors_1.Colors.dim('–')}`,
            `  ${label('Project')}${entry.project ?? Colors_1.Colors.dim('–')}`,
            `  ${label('Git Branch')}${entry.gitBranch ? Colors_1.Colors.dim(entry.gitBranch) : Colors_1.Colors.dim('–')}`,
        ];
    }
    renderTree(tree) {
        if (tree.length === 0)
            return [`  ${Colors_1.Colors.dim('(unavailable)')}`];
        const lines = [];
        for (let i = 0; i < tree.length; i++) {
            const node = tree[i];
            const isRoot = i === 0;
            const indent = '  ' + '   '.repeat(i);
            const glyph = isRoot ? Colors_1.Colors.treeGlyph('→') : Colors_1.Colors.treeGlyph('└─');
            const label = `${node.command} (${node.pid})`;
            lines.push(`${indent}${glyph} ${label}`);
        }
        return lines;
    }
    renderKillHint(entry) {
        const cmd = Colors_1.Colors.killCommand('ports clean');
        const pid = Colors_1.Colors.killPid(`kill ${entry.pid}`);
        return `  ${Colors_1.Colors.dim('Kill this process:')} ${cmd}  ${Colors_1.Colors.dim('or')}  ${pid}`;
    }
}
exports.DetailRenderer = DetailRenderer;
//# sourceMappingURL=DetailRenderer.js.map
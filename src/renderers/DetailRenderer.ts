import { PortEntry, ProcessNode } from '../types';
import { Colors } from './Colors';
import { IRenderer } from '../interfaces/IRenderer';

interface DetailData {
  entry: PortEntry;
  tree: ProcessNode[];
}

/**
 * Renders the detail view for a single port (ports <number>).
 */
export class DetailRenderer implements IRenderer<DetailData> {
  render(data: DetailData): string {
    const { entry, tree } = data;
    const lines: string[] = [''];

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

  private renderFields(entry: PortEntry): string[] {
    const label = (s: string) => Colors.sectionLabel(s.padEnd(14));
    const val   = (s: string) => s;

    const statusVal =
      entry.status === 'healthy'
        ? Colors.statusHealthy(`● ${entry.status}`)
        : Colors.statusUnhealthy(`● ${entry.status}`);

    const frameworkVal = entry.framework
      ? Colors.framework(entry.framework.color)(entry.framework.name)
      : Colors.dim('–');

    return [
      `  ${label('Process')}${val(entry.process)}`,
      `  ${label('PID')}${Colors.pid(String(entry.pid))}`,
      `  ${label('Status')}${statusVal}`,
      `  ${label('Framework')}${frameworkVal}`,
      `  ${label('Memory')}${entry.memory ? Colors.memory(entry.memory) : Colors.dim('–')}`,
      `  ${label('Uptime')}${Colors.uptime(entry.uptime)}`,
      `  ${label('Started')}${entry.startedAt ? Colors.dim(entry.startedAt) : Colors.dim('–')}`,
    ];
  }

  private renderSection(title: string): string[] {
    const dashes = Colors.dim('─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─');
    return [`  ${Colors.sectionLabel(title.padEnd(14))}${dashes}`];
  }

  private renderLocation(entry: PortEntry): string[] {
    const label = (s: string) => Colors.sectionLabel(s.padEnd(14));
    return [
      `  ${label('Directory')}${entry.directory ? Colors.directory(entry.directory) : Colors.dim('–')}`,
      `  ${label('Project')}${entry.project ?? Colors.dim('–')}`,
      `  ${label('Git Branch')}${entry.gitBranch ? Colors.dim(entry.gitBranch) : Colors.dim('–')}`,
    ];
  }

  private renderTree(tree: ProcessNode[]): string[] {
    if (tree.length === 0) return [`  ${Colors.dim('(unavailable)')}`];

    const lines: string[] = [];
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      const isRoot = i === 0;
      const indent = '  ' + '   '.repeat(i);
      const glyph = isRoot ? Colors.treeGlyph('→') : Colors.treeGlyph('└─');
      const label = `${node.command} (${node.pid})`;
      lines.push(`${indent}${glyph} ${label}`);
    }
    return lines;
  }

  private renderKillHint(entry: PortEntry): string {
    const cmd = Colors.killCommand('ports clean');
    const pid = Colors.killPid(`kill ${entry.pid}`);
    return `  ${Colors.dim('Kill this process:')} ${cmd}  ${Colors.dim('or')}  ${pid}`;
  }
}

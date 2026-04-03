import { PortEntry } from '../types';
import { Colors } from './Colors';
import { IRenderer } from '../interfaces/IRenderer';

interface TableOptions {
  /** PIDs of newly appeared ports (highlighted green in watch mode). */
  newPids?: Set<number>;
  /** Entries to show as removed (flash red in watch mode). */
  removedEntries?: PortEntry[];
}

const COLS = {
  port:      { header: 'PORT',      min: 8  },
  process:   { header: 'PROCESS',   min: 10 },
  pid:       { header: 'PID',       min: 8  },
  project:   { header: 'PROJECT',   min: 20 },
  framework: { header: 'FRAMEWORK', min: 12 },
  cpu:       { header: 'CPU',       min: 8  },
  memory:    { header: 'MEM',       min: 10 },
  uptime:    { header: 'UPTIME',    min: 10 },
  status:    { header: 'STATUS',    min: 10 },
} as const;

type ColKey = keyof typeof COLS;

/**
 * Renders the main port table. Calculates dynamic column widths based on content.
 */
export class TableRenderer implements IRenderer<PortEntry[]> {
  render(entries: PortEntry[], options: TableOptions = {}): string {
    const allEntries = [
      ...(options.removedEntries ?? []),
      ...entries,
    ];

    const widths = this.calculateWidths(allEntries);
    const lines: string[] = [];

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

  private calculateWidths(entries: PortEntry[]): Record<ColKey, number> {
    const widths: Record<ColKey, number> = {
      port:      COLS.port.min,
      process:   COLS.process.min,
      pid:       COLS.pid.min,
      project:   COLS.project.min,
      framework: COLS.framework.min,
      cpu:       COLS.cpu.min,
      memory:    COLS.memory.min,
      uptime:    COLS.uptime.min,
      status:    COLS.status.min,
    };

    for (const e of entries) {
      widths.port      = Math.max(widths.port,      `:${e.port}`.length + 2);
      widths.process   = Math.max(widths.process,   e.process.length + 2);
      widths.pid       = Math.max(widths.pid,       String(e.pid).length + 2);
      widths.project   = Math.max(widths.project,   (e.project ?? '–').length + 2);
      widths.framework = Math.max(widths.framework, (e.framework?.name ?? '–').length + 2);
      widths.cpu       = Math.max(widths.cpu,       e.cpu.length + 2);
      widths.memory    = Math.max(widths.memory,    e.memory.length + 2);
      widths.uptime    = Math.max(widths.uptime,    e.uptime.length + 2);
    }

    return widths;
  }

  private renderHeader(widths: Record<ColKey, number>): string {
    const cols: ColKey[] = ['port', 'process', 'pid', 'project', 'framework', 'cpu', 'memory', 'uptime', 'status'];
    const parts = cols.map((k) => Colors.header(COLS[k].header.padEnd(widths[k])));
    return '  ' + parts.join('');
  }

  private renderRow(
    entry: PortEntry,
    widths: Record<ColKey, number>,
    highlight: 'normal' | 'new' | 'removed',
  ): string {
    const portStr      = `:${entry.port}`;
    const processStr   = entry.process;
    const pidStr       = String(entry.pid);
    const projectStr   = entry.project ?? '–';
    const frameworkStr = entry.framework?.name ?? '–';
    const cpuStr       = entry.cpu;
    const memStr       = entry.memory;
    const uptimeStr    = entry.uptime;
    const statusStr    = `● ${entry.status}`;

    // Pad raw strings first, then colorize — avoids ANSI code length confusion
    const coloredCells = [
      Colors.port(portStr.padEnd(widths.port)),
      Colors.process(processStr.padEnd(widths.process)),
      Colors.pid(pidStr.padEnd(widths.pid)),
      entry.project
        ? Colors.project(projectStr.padEnd(widths.project))
        : Colors.dim(projectStr.padEnd(widths.project)),
      entry.framework
        ? Colors.framework(entry.framework.color)(frameworkStr.padEnd(widths.framework))
        : Colors.dim(frameworkStr.padEnd(widths.framework)),
      Colors.cpu(cpuStr.padEnd(widths.cpu)),
      Colors.memory(memStr.padEnd(widths.memory)),
      Colors.uptime(uptimeStr.padEnd(widths.uptime)),
      entry.status === 'healthy'
        ? Colors.statusHealthy(statusStr)
        : Colors.statusUnhealthy(statusStr),
    ];

    const row = '  ' + coloredCells.join('');

    if (highlight === 'new') return Colors.newPort(row);
    if (highlight === 'removed') return Colors.removedPort(row);
    return row;
  }
}

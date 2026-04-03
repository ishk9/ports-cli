import { OrphanEntry } from '../types';
import { Colors } from './Colors';
import { IRenderer } from '../interfaces/IRenderer';

/**
 * Renders the orphan list table used by `ports clean`.
 */
export class CleanRenderer implements IRenderer<OrphanEntry[]> {
  render(orphans: OrphanEntry[]): string {
    if (orphans.length === 0) {
      return `\n  ${Colors.success('✓')} ${Colors.dim('No orphaned ports found.')}\n`;
    }

    const portW   = Math.max(6,  ...orphans.map((o) => `:${o.port}`.length)) + 2;
    const procW   = Math.max(9,  ...orphans.map((o) => o.process.length)) + 2;
    const pidW    = Math.max(5,  ...orphans.map((o) => String(o.pid).length)) + 2;
    const reasonW = Math.max(8,  ...orphans.map((o) => o.orphanReason.length)) + 2;

    const header = [
      Colors.header('PORT'.padEnd(portW)),
      Colors.header('PROCESS'.padEnd(procW)),
      Colors.header('PID'.padEnd(pidW)),
      Colors.header('REASON'.padEnd(reasonW)),
    ].join('');

    const rows = orphans.map((o) => {
      return [
        Colors.port(`:${o.port}`.padEnd(portW)),
        Colors.process(o.process.padEnd(procW)),
        Colors.pid(String(o.pid).padEnd(pidW)),
        Colors.dim(o.orphanReason.padEnd(reasonW)),
      ].join('');
    });

    const lines = [
      '',
      `  ${Colors.dim('Scanning for orphaned ports...')}`,
      '',
      `  ${Colors.error(`Found ${orphans.length} orphaned port${orphans.length !== 1 ? 's' : ''}:`)}`,
      '',
      `  ${header}`,
      ...rows.map((r) => `  ${r}`),
      '',
    ];

    return lines.join('\n');
  }

  renderKillResult(killed: Array<{ port: number; pid: number }>): string {
    const lines = [''];
    for (const k of killed) {
      lines.push(`  ${Colors.success('✓')} Killed ${Colors.port(`:${k.port}`)} (PID ${Colors.pid(String(k.pid))})`);
    }
    lines.push('');
    lines.push(`  ${Colors.dim(`${killed.length} port${killed.length !== 1 ? 's' : ''} cleaned.`)}`);
    lines.push('');
    return lines.join('\n');
  }

  renderNoneFound(): string {
    return `\n  ${Colors.success('✓')} ${Colors.dim('No orphaned ports found.')}\n`;
  }
}

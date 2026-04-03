import * as readline from 'readline';
import { execSync } from 'child_process';
import { ICommand } from '../interfaces/ICommand';
import { IPortScanner } from '../interfaces/IPortScanner';
import { PortScanner } from '../core/PortScanner';
import { OrphanDetector } from '../core/OrphanDetector';
import { CleanRenderer } from '../renderers/CleanRenderer';
import { TableRenderer } from '../renderers/TableRenderer';
import { Colors } from '../renderers/Colors';
import { PortEntry } from '../types';

interface CleanCommandOptions {
  /** If provided, only kill this specific port. */
  targetPort?: number;
}

/**
 * Handles `ports clean` and `ports clean <number>`.
 */
export class CleanCommand implements ICommand {
  private readonly scanner: IPortScanner;
  private readonly orphanDetector: OrphanDetector;
  private readonly cleanRenderer: CleanRenderer;
  private readonly tableRenderer: TableRenderer;

  constructor(
    private readonly options: CleanCommandOptions = {},
    scanner?: IPortScanner,
  ) {
    this.scanner = scanner ?? new PortScanner();
    this.orphanDetector = new OrphanDetector();
    this.cleanRenderer = new CleanRenderer();
    this.tableRenderer = new TableRenderer();
  }

  async execute(): Promise<void> {
    if (this.options.targetPort !== undefined) {
      await this.killSpecificPort(this.options.targetPort);
    } else {
      await this.killOrphans();
    }
  }

  private async killSpecificPort(port: number): Promise<void> {
    const entries = await this.scanner.scan(false);
    const entry = entries.find((e) => e.port === port);

    if (!entry) {
      console.log(`\n  ${Colors.error(`No process found on port :${port}`)}\n`);
      return;
    }

    console.log('\n' + this.tableRenderer.render([entry]));
    console.log('');

    const confirmed = await this.prompt(`  ${Colors.prompt(`Kill process on :${port}? [y/N]`)} `);
    if (confirmed) {
      this.kill(entry);
      console.log(this.cleanRenderer.renderKillResult([{ port: entry.port, pid: entry.pid }]));
    } else {
      console.log(`\n  ${Colors.dim('Aborted.')}\n`);
    }
  }

  private async killOrphans(): Promise<void> {
    const entries = await this.scanner.scan(false);
    const orphans = this.orphanDetector.detect(entries);

    process.stdout.write(this.cleanRenderer.render(orphans));

    if (orphans.length === 0) return;

    const confirmed = await this.prompt(`  ${Colors.prompt('Kill all? [y/N]')} `);

    if (!confirmed) {
      console.log(`\n  ${Colors.dim('Aborted.')}\n`);
      return;
    }

    const killed: Array<{ port: number; pid: number }> = [];
    for (const orphan of orphans) {
      try {
        this.kill(orphan);
        killed.push({ port: orphan.port, pid: orphan.pid });
      } catch {
        console.log(`  ${Colors.error('✗')} Failed to kill :${orphan.port} (PID ${orphan.pid})`);
      }
    }

    console.log(this.cleanRenderer.renderKillResult(killed));
  }

  private kill(entry: PortEntry): void {
    try {
      execSync(`kill ${entry.pid} 2>/dev/null`, { stdio: 'pipe' });
    } catch {
      execSync(`kill -9 ${entry.pid} 2>/dev/null`, { stdio: 'pipe' });
    }
  }

  private prompt(question: string): Promise<boolean> {
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

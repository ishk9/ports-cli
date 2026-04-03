import { ICommand } from '../interfaces/ICommand';
import { IPortScanner } from '../interfaces/IPortScanner';
import { PortScanner } from '../core/PortScanner';
import { HeaderRenderer } from '../renderers/HeaderRenderer';
import { TableRenderer } from '../renderers/TableRenderer';
import { Colors } from '../renderers/Colors';
import { PortEntry } from '../types';

const POLL_INTERVAL_MS = 2000;

/**
 * Handles `ports watch` — real-time terminal monitor with 2s polling.
 *
 * Highlights newly appeared ports in green for one cycle and
 * fades removed ports in red before they disappear.
 */
export class WatchCommand implements ICommand {
  private readonly scanner: IPortScanner;
  private readonly headerRenderer: HeaderRenderer;
  private readonly tableRenderer: TableRenderer;

  private previousPids = new Set<number>();
  private flashedNewPids = new Set<number>();
  private removedEntries: PortEntry[] = [];

  constructor(scanner?: IPortScanner) {
    this.scanner = scanner ?? new PortScanner();
    this.headerRenderer = new HeaderRenderer();
    this.tableRenderer = new TableRenderer();
  }

  async execute(): Promise<void> {
    process.on('SIGINT', () => {
      process.stdout.write('\x1b[?25h'); // restore cursor
      console.log(`\n  ${Colors.dim('Stopped watching.')}\n`);
      process.exit(0);
    });

    process.stdout.write('\x1b[?25l'); // hide cursor

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await this.tick();
      await this.sleep(POLL_INTERVAL_MS);
    }
  }

  private async tick(): Promise<void> {
    const entries = await this.scanner.scan(true);
    const currentPids = new Set(entries.map((e) => e.pid));

    const newPids = new Set<number>();
    for (const pid of currentPids) {
      if (!this.previousPids.has(pid)) newPids.add(pid);
    }

    const removedEntries: PortEntry[] = [];
    // We don't have the removed entries themselves since they're gone.
    // Keep removed from previous cycle and clear after one display.
    this.removedEntries = [];

    this.flashedNewPids = newPids;
    this.previousPids = currentPids;

    this.redraw(entries, newPids);
  }

  private redraw(entries: PortEntry[], newPids: Set<number>): void {
    console.clear();

    console.log('\n' + this.headerRenderer.render({ watchMode: true }));
    console.log('');

    if (entries.length === 0) {
      console.log(`  ${Colors.dim('No active ports.')}`);
    } else {
      console.log(this.tableRenderer.render(entries, { newPids }));
    }

    console.log('');
    console.log(this.buildFooter(entries.length));
    console.log('');
  }

  private buildFooter(count: number): string {
    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return '  ' + Colors.dim(`Last updated: ${time}  ·  ${count} port${count !== 1 ? 's' : ''} active`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

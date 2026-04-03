import * as readline from 'readline';
import { ICommand } from '../interfaces/ICommand';
import { IPortScanner } from '../interfaces/IPortScanner';
import { PortScanner } from '../core/PortScanner';
import { ProcessInspector } from '../core/ProcessInspector';
import { DetailRenderer } from '../renderers/DetailRenderer';
import { Colors } from '../renderers/Colors';
import { execSync } from 'child_process';

/**
 * Handles `ports <number>` — shows details for a specific port and offers a kill prompt.
 */
export class DetailCommand implements ICommand {
  private readonly scanner: IPortScanner;
  private readonly inspector: ProcessInspector;
  private readonly renderer: DetailRenderer;

  constructor(
    private readonly port: number,
    scanner?: IPortScanner,
  ) {
    this.scanner = scanner ?? new PortScanner();
    this.inspector = new ProcessInspector();
    this.renderer = new DetailRenderer();
  }

  async execute(): Promise<void> {
    const entries = await this.scanner.scan(false);
    const entry = entries.find((e) => e.port === this.port);

    if (!entry) {
      console.log(`\n  ${Colors.error(`No process found on port :${this.port}`)}\n`);
      return;
    }

    const tree = this.inspector.getProcessTree(entry.pid);
    console.log(this.renderer.render({ entry, tree }));

    const kill = await this.promptKill(this.port);
    if (kill) {
      this.killProcess(entry.pid, this.port);
    }
  }

  private promptKill(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        `  ${Colors.prompt(`Kill process on :${port}? [y/N]`)} `,
        (answer) => {
          rl.close();
          resolve(answer.trim().toLowerCase() === 'y');
        },
      );
    });
  }

  private killProcess(pid: number, port: number): void {
    try {
      execSync(`kill ${pid} 2>/dev/null`, { stdio: 'pipe' });
      console.log(`\n  ${Colors.success('✓')} Killed ${Colors.port(`:${port}`)} (PID ${Colors.pid(String(pid))})\n`);
    } catch {
      try {
        execSync(`kill -9 ${pid} 2>/dev/null`, { stdio: 'pipe' });
        console.log(`\n  ${Colors.success('✓')} Killed ${Colors.port(`:${port}`)} (PID ${Colors.pid(String(pid))})\n`);
      } catch {
        console.log(`\n  ${Colors.error('✗')} Failed to kill PID ${pid}. Try: ${Colors.killPid(`sudo kill ${pid}`)}\n`);
      }
    }
  }
}

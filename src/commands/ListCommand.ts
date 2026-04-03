import { ICommand } from '../interfaces/ICommand';
import { IPortScanner } from '../interfaces/IPortScanner';
import { PortScanner } from '../core/PortScanner';
import { HeaderRenderer } from '../renderers/HeaderRenderer';
import { TableRenderer } from '../renderers/TableRenderer';
import { Colors } from '../renderers/Colors';

interface ListCommandOptions {
  showAll: boolean;
}

/**
 * Handles `ports` and `ports --all`.
 */
export class ListCommand implements ICommand {
  private readonly scanner: IPortScanner;
  private readonly headerRenderer: HeaderRenderer;
  private readonly tableRenderer: TableRenderer;

  constructor(
    private readonly options: ListCommandOptions,
    scanner?: IPortScanner,
  ) {
    this.scanner = scanner ?? new PortScanner();
    this.headerRenderer = new HeaderRenderer();
    this.tableRenderer = new TableRenderer();
  }

  async execute(): Promise<void> {
    const entries = await this.scanner.scan(!this.options.showAll);

    console.log('\n' + this.headerRenderer.render());
    console.log('');

    if (entries.length === 0) {
      console.log(`  ${Colors.dim('No active ports found.')}`);
    } else {
      console.log(this.tableRenderer.render(entries));
    }

    console.log('');
    console.log(this.buildFooter(entries.length));
    console.log('');
  }

  private buildFooter(count: number): string {
    const parts: string[] = [
      `${count} port${count !== 1 ? 's' : ''} active`,
      'Run ports <number> for details',
    ];

    if (!this.options.showAll) {
      parts.push('--all to show everything');
    }

    return '  ' + Colors.dim(parts.join('  ·  '));
  }
}

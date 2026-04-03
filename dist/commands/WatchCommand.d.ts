import { ICommand } from '../interfaces/ICommand';
import { IPortScanner } from '../interfaces/IPortScanner';
/**
 * Handles `ports watch` — real-time terminal monitor with 2s polling.
 *
 * Highlights newly appeared ports in green for one cycle and
 * fades removed ports in red before they disappear.
 */
export declare class WatchCommand implements ICommand {
    private readonly scanner;
    private readonly headerRenderer;
    private readonly tableRenderer;
    private previousPids;
    private flashedNewPids;
    private removedEntries;
    constructor(scanner?: IPortScanner);
    execute(): Promise<void>;
    private tick;
    private redraw;
    private buildFooter;
    private sleep;
}
//# sourceMappingURL=WatchCommand.d.ts.map
import { ICommand } from '../interfaces/ICommand';
import { IPortScanner } from '../interfaces/IPortScanner';
/**
 * Handles `ports <number>` — shows details for a specific port and offers a kill prompt.
 */
export declare class DetailCommand implements ICommand {
    private readonly port;
    private readonly scanner;
    private readonly inspector;
    private readonly renderer;
    constructor(port: number, scanner?: IPortScanner);
    execute(): Promise<void>;
    private promptKill;
    private killProcess;
}
//# sourceMappingURL=DetailCommand.d.ts.map
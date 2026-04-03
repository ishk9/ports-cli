import { ICommand } from '../interfaces/ICommand';
import { IPortScanner } from '../interfaces/IPortScanner';
interface CleanCommandOptions {
    /** If provided, only kill this specific port. */
    targetPort?: number;
}
/**
 * Handles `ports clean` and `ports clean <number>`.
 */
export declare class CleanCommand implements ICommand {
    private readonly options;
    private readonly scanner;
    private readonly orphanDetector;
    private readonly cleanRenderer;
    private readonly tableRenderer;
    constructor(options?: CleanCommandOptions, scanner?: IPortScanner);
    execute(): Promise<void>;
    private killSpecificPort;
    private killOrphans;
    private kill;
    private prompt;
}
export {};
//# sourceMappingURL=CleanCommand.d.ts.map
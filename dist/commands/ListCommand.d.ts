import { ICommand } from '../interfaces/ICommand';
import { IPortScanner } from '../interfaces/IPortScanner';
interface ListCommandOptions {
    showAll: boolean;
}
/**
 * Handles `ports` and `ports --all`.
 */
export declare class ListCommand implements ICommand {
    private readonly options;
    private readonly scanner;
    private readonly headerRenderer;
    private readonly tableRenderer;
    constructor(options: ListCommandOptions, scanner?: IPortScanner);
    execute(): Promise<void>;
    private buildFooter;
}
export {};
//# sourceMappingURL=ListCommand.d.ts.map
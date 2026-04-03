import { PortEntry } from '../types';
import { IRenderer } from '../interfaces/IRenderer';
interface TableOptions {
    /** PIDs of newly appeared ports (highlighted green in watch mode). */
    newPids?: Set<number>;
    /** Entries to show as removed (flash red in watch mode). */
    removedEntries?: PortEntry[];
}
/**
 * Renders the main port table. Calculates dynamic column widths based on content.
 */
export declare class TableRenderer implements IRenderer<PortEntry[]> {
    render(entries: PortEntry[], options?: TableOptions): string;
    private calculateWidths;
    private renderHeader;
    private renderRow;
}
export {};
//# sourceMappingURL=TableRenderer.d.ts.map
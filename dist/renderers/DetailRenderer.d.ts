import { PortEntry, ProcessNode } from '../types';
import { IRenderer } from '../interfaces/IRenderer';
interface DetailData {
    entry: PortEntry;
    tree: ProcessNode[];
}
/**
 * Renders the detail view for a single port (ports <number>).
 */
export declare class DetailRenderer implements IRenderer<DetailData> {
    render(data: DetailData): string;
    private renderFields;
    private renderSection;
    private renderLocation;
    private renderTree;
    private renderKillHint;
}
export {};
//# sourceMappingURL=DetailRenderer.d.ts.map
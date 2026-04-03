import { OrphanEntry } from '../types';
import { IRenderer } from '../interfaces/IRenderer';
/**
 * Renders the orphan list table used by `ports clean`.
 */
export declare class CleanRenderer implements IRenderer<OrphanEntry[]> {
    render(orphans: OrphanEntry[]): string;
    renderKillResult(killed: Array<{
        port: number;
        pid: number;
    }>): string;
    renderNoneFound(): string;
}
//# sourceMappingURL=CleanRenderer.d.ts.map
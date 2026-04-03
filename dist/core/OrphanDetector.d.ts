import { PortEntry, OrphanEntry } from '../types';
/**
 * Identifies orphaned ports from a list of active PortEntry objects.
 *
 * A port is considered orphaned when:
 *   1. No project directory could be detected, OR
 *   2. The process name is not a recognized dev tool and has no framework.
 * Additionally the process must have been running long enough to not be
 * a just-started background task (avoids false positives on startup).
 */
export declare class OrphanDetector {
    detect(entries: PortEntry[]): OrphanEntry[];
    private isOrphaned;
    private buildReason;
    /**
     * Converts a human-readable uptime string back to minutes for comparison.
     * Handles formats produced by ProcessInspector: "21m 11s", "1h 30m", "2d 3h".
     */
    private uptimeToMinutes;
}
//# sourceMappingURL=OrphanDetector.d.ts.map
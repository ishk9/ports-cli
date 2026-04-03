"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrphanDetector = void 0;
const ORPHAN_MIN_UPTIME_MINUTES = 5;
/**
 * Identifies orphaned ports from a list of active PortEntry objects.
 *
 * A port is considered orphaned when:
 *   1. No project directory could be detected, OR
 *   2. The process name is not a recognized dev tool and has no framework.
 * Additionally the process must have been running long enough to not be
 * a just-started background task (avoids false positives on startup).
 */
class OrphanDetector {
    detect(entries) {
        return entries
            .filter((e) => this.isOrphaned(e))
            .map((e) => ({
            ...e,
            orphanReason: this.buildReason(e),
        }));
    }
    isOrphaned(entry) {
        const hasProject = entry.project !== null || entry.framework !== null;
        if (hasProject)
            return false;
        const uptimeMinutes = this.uptimeToMinutes(entry.uptime);
        return uptimeMinutes >= ORPHAN_MIN_UPTIME_MINUTES;
    }
    buildReason(entry) {
        const uptimeMins = this.uptimeToMinutes(entry.uptime);
        if (uptimeMins >= 60 * 2) {
            return `No project detected, idle ${entry.uptime}`;
        }
        return 'No project detected';
    }
    /**
     * Converts a human-readable uptime string back to minutes for comparison.
     * Handles formats produced by ProcessInspector: "21m 11s", "1h 30m", "2d 3h".
     */
    uptimeToMinutes(uptime) {
        let minutes = 0;
        const days = uptime.match(/(\d+)d/);
        const hours = uptime.match(/(\d+)h/);
        const mins = uptime.match(/(\d+)m/);
        if (days)
            minutes += parseInt(days[1], 10) * 60 * 24;
        if (hours)
            minutes += parseInt(hours[1], 10) * 60;
        if (mins)
            minutes += parseInt(mins[1], 10);
        return minutes;
    }
}
exports.OrphanDetector = OrphanDetector;
//# sourceMappingURL=OrphanDetector.js.map
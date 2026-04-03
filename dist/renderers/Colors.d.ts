import chalk from 'chalk';
import { FrameworkColorKey } from '../types';
/**
 * Centralized color definitions — single place to change the entire palette.
 */
export declare const Colors: {
    readonly port: chalk.Chalk;
    readonly process: chalk.Chalk;
    readonly pid: chalk.Chalk;
    readonly project: chalk.Chalk;
    readonly uptime: chalk.Chalk;
    readonly statusHealthy: chalk.Chalk;
    readonly statusUnhealthy: chalk.Chalk;
    readonly header: chalk.Chalk;
    readonly dim: chalk.Chalk;
    readonly success: chalk.Chalk;
    readonly error: chalk.Chalk;
    readonly prompt: chalk.Chalk;
    readonly killCommand: chalk.Chalk;
    readonly killPid: chalk.Chalk;
    readonly sectionLabel: chalk.Chalk;
    readonly treeGlyph: chalk.Chalk;
    readonly memory: chalk.Chalk;
    readonly cpu: (pct: string) => string;
    readonly directory: chalk.Chalk;
    readonly watching: chalk.Chalk;
    readonly newPort: chalk.Chalk;
    readonly removedPort: chalk.Chalk;
    readonly brand: chalk.Chalk;
    readonly tagline: chalk.Chalk;
    readonly framework: (color: FrameworkColorKey) => chalk.Chalk;
};
//# sourceMappingURL=Colors.d.ts.map
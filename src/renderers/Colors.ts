import chalk from 'chalk';
import { FrameworkColorKey } from '../types';

/**
 * Centralized color definitions — single place to change the entire palette.
 */
export const Colors = {
  port: chalk.yellow,
  process: chalk.white,
  pid: chalk.gray,
  project: chalk.magenta,
  uptime: chalk.green,
  statusHealthy: chalk.green,
  statusUnhealthy: chalk.red,
  header: chalk.cyan.bold,
  dim: chalk.dim,
  success: chalk.green.bold,
  error: chalk.red.bold,
  prompt: chalk.yellow,
  killCommand: chalk.cyan,
  killPid: chalk.red,
  sectionLabel: chalk.dim,
  treeGlyph: chalk.gray,
  memory: chalk.green,
  directory: chalk.magenta,
  watching: chalk.dim,
  newPort: chalk.green.bold,
  removedPort: chalk.red.bold,
  brand: chalk.cyan.bold,
  tagline: chalk.dim,

  framework(color: FrameworkColorKey): chalk.Chalk {
    const map: Record<FrameworkColorKey, chalk.Chalk> = {
      cyan: chalk.cyan,
      blue: chalk.blue,
      red: chalk.red,
      green: chalk.green,
      magenta: chalk.magenta,
      yellow: chalk.yellow,
      white: chalk.white,
    };
    return map[color] ?? chalk.white;
  },
} as const;

#!/usr/bin/env node

import { Command } from 'commander';
import { ListCommand } from './commands/ListCommand';
import { DetailCommand } from './commands/DetailCommand';
import { CleanCommand } from './commands/CleanCommand';
import { WatchCommand } from './commands/WatchCommand';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version } = require('../package.json') as { version: string };

const program = new Command();

program
  .name('ports')
  .description('ports — instantly surface active ports on your machine')
  .version(version)
  .option('--all', 'show all ports, not just dev servers')
  .argument('[port]', 'show details for a specific port number')
  .action(async (portArg: string | undefined, options: { all?: boolean }) => {
    if (portArg !== undefined) {
      const port = parseInt(portArg, 10);
      if (isNaN(port)) {
        console.error(`  Invalid port number: ${portArg}`);
        process.exit(1);
      }
      await new DetailCommand(port).execute();
    } else {
      await new ListCommand({ showAll: options.all ?? false }).execute();
    }
  });

program
  .command('clean [port]')
  .description('kill orphaned ports, or a specific port by number')
  .action(async (portArg: string | undefined) => {
    if (portArg !== undefined) {
      const port = parseInt(portArg, 10);
      if (isNaN(port)) {
        console.error(`  Invalid port number: ${portArg}`);
        process.exit(1);
      }
      await new CleanCommand({ targetPort: port }).execute();
    } else {
      await new CleanCommand().execute();
    }
  });

program
  .command('watch')
  .description('monitor ports in real-time, refreshing every 2 seconds')
  .action(async () => {
    await new WatchCommand().execute();
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});

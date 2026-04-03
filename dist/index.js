#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const ListCommand_1 = require("./commands/ListCommand");
const DetailCommand_1 = require("./commands/DetailCommand");
const CleanCommand_1 = require("./commands/CleanCommand");
const WatchCommand_1 = require("./commands/WatchCommand");
const program = new commander_1.Command();
program
    .name('ports')
    .description('ports — instantly surface active ports on your machine')
    .version('1.0.0')
    .option('--all', 'show all ports, not just dev servers')
    .argument('[port]', 'show details for a specific port number')
    .action(async (portArg, options) => {
    if (portArg !== undefined) {
        const port = parseInt(portArg, 10);
        if (isNaN(port)) {
            console.error(`  Invalid port number: ${portArg}`);
            process.exit(1);
        }
        await new DetailCommand_1.DetailCommand(port).execute();
    }
    else {
        await new ListCommand_1.ListCommand({ showAll: options.all ?? false }).execute();
    }
});
program
    .command('clean [port]')
    .description('kill orphaned ports, or a specific port by number')
    .action(async (portArg) => {
    if (portArg !== undefined) {
        const port = parseInt(portArg, 10);
        if (isNaN(port)) {
            console.error(`  Invalid port number: ${portArg}`);
            process.exit(1);
        }
        await new CleanCommand_1.CleanCommand({ targetPort: port }).execute();
    }
    else {
        await new CleanCommand_1.CleanCommand().execute();
    }
});
program
    .command('watch')
    .description('monitor ports in real-time, refreshing every 2 seconds')
    .action(async () => {
    await new WatchCommand_1.WatchCommand().execute();
});
program.parseAsync(process.argv).catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
});
//# sourceMappingURL=index.js.map
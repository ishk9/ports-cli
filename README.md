# ports

> A zero-config CLI that instantly surfaces active ports on your machine.

```
┌─────────────────────────────────────────────────────────────────┐
│  🔊 ports                                                       │
│  listening to your ports...                                     │
└─────────────────────────────────────────────────────────────────┘

  PORT    PROCESS   PID     PROJECT          FRAMEWORK   UPTIME    STATUS
  :3000   node      9558    git-weekly       Next.js     21m 11s   ● healthy
  :5432   docker    40827   shared-postgres  PostgreSQL  2m 20s    ● healthy
  :6379   docker    40827   shared-redis     Redis       2m 20s    ● healthy

  3 ports active  ·  Run ports <number> for details  ·  --all to show everything
```

## Install

```bash
npm install -g .
```

Or link for local development:

```bash
npm link
```

## Commands

| Command | Description |
|---|---|
| `ports` | List active dev server ports |
| `ports --all` | List every listening port |
| `ports <number>` | Show details + kill prompt for a port |
| `ports clean` | Detect and kill orphaned ports |
| `ports clean <number>` | Kill a specific port |
| `ports watch` | Real-time monitor (Ctrl+C to exit) |

## Development

```bash
# Build TypeScript
npm run build

# Run directly without build
npm run dev

# Type-check only
npm run lint
```

## Architecture

```
src/
├── types/            Shared TypeScript types
├── interfaces/       ICommand, IPortScanner, IFrameworkDetector, IRenderer
├── core/             PortScanner, ProjectDetector, ProcessInspector, OrphanDetector, DockerResolver
├── strategies/
│   └── framework/    Per-framework detectors + FrameworkDetectorRegistry (Singleton + Strategy)
├── renderers/        HeaderRenderer, TableRenderer, DetailRenderer, CleanRenderer, Colors
├── commands/         ListCommand, DetailCommand, CleanCommand, WatchCommand (Command pattern)
└── index.ts          CLI entry point (Commander.js)
```

**Design patterns used:** Command, Strategy, Registry (Singleton), Factory.

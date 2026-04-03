# ports — CLI Design Spec

## Overview

A zero-config CLI that surfaces active ports on your machine with process context, framework detection, and one-command cleanup.

---

## Branding

```
🔊 Port Whisperer
listening to your ports...
```

- Name: **Port Whisperer**
- Tagline: `listening to your ports...`
- Shown in a rounded border box at the top of every `ports` invocation

---

## Commands

| Command | Description |
|---|---|
| `ports` | List all dev-related active ports |
| `ports --all` | List every port (including system/app ports) |
| `ports <number>` | Show detailed info for a specific port |
| `ports clean` | Kill orphaned/stale ports (interactive confirm) |
| `ports clean <number>` | Kill a specific port number (interactive confirm) |
| `ports watch` | Real-time monitor, refreshes on change |

---

## `ports` — Main View

Lists ports filtered to likely dev servers (node, python, ruby, docker, etc.).

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🔊 Port Whisperer                                              │
│  listening to your ports...                                     │
└─────────────────────────────────────────────────────────────────┘

  PORT     PROCESS   PID     PROJECT              FRAMEWORK   UPTIME     STATUS
  :3000    node      9558    git-weekly           Next.js     21m 11s    ● healthy
  :5432    docker    40827   backend-postgres-1   PostgreSQL  2m 20s     ● healthy
  :6379    docker    40827   backend-redis-1      Redis       2m 20s     ● healthy

  3 ports active  ·  Run ports <number> for details  ·  --all to show everything
```

### Column Specs

| Column | Color | Notes |
|---|---|---|
| PORT | Yellow / Gold | e.g. `:3000` |
| PROCESS | White | process binary name |
| PID | Gray | numeric |
| PROJECT | Purple / Violet | inferred from cwd or container name |
| FRAMEWORK | Cyan / Framework color | Next.js=cyan, PostgreSQL=blue, Redis=red |
| UPTIME | Green | human-readable duration |
| STATUS | Green dot + text | `● healthy` |

### Footer
```
  N ports active  ·  Run ports <number> for details  ·  --all to show everything
```
Dim/muted color. Centered dots as separators.

---

## `ports <number>` — Detail View

```
  Process       node
  PID           9558
  Status        ● healthy
  Framework     Next.js
  Memory        62.0 MB
  Uptime        21m 16s
  Started       4/2/2026, 8:51:24 PM

  Location      ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

  Directory     /Users/username/Documents/projects/git-weekly
  Project       git-weekly
  Git Branch    main

  Process Tree  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

  → next-server (v14.2.13) (9558)
  └─ node (9533)
     └─ npm run dev (9516)
        └─ /bin/zsh (88577)
           └─ Cursor Helper: terminal pty-host (3594)
              └─ /Applications/Cursor.app/... (665)

  Kill this process: ports clean  or  kill 9558

  Kill process on :3000? [y/N]
```

### Field Colors

| Field | Color |
|---|---|
| Labels (Process, PID…) | Dim white |
| Values | Bright white |
| Status value | Green with dot |
| Memory | Green |
| Uptime | Green |
| Directory | Purple / Violet |
| Section headers (Location, Process Tree) | Dim, with dashed separator |
| Process tree arrows/lines | Gray |
| Kill hint command | Cyan |
| Kill hint PID | Red |
| `[y/N]` prompt | Yellow |

---

## `ports --all` — Full View

Same table as `ports` but includes all system processes, not filtered to dev servers.

```
  :55018   Linear      20054   –   –   10d 12h   ● healthy
  :55306   TablePlus   97458   –   –   9d 11h    ● healthy
  ...
  33 ports active  ·  Run ports <number> for details
```

- PROJECT and FRAMEWORK show `–` when unknown
- No `--all to show everything` hint in footer (already in --all mode)

---

## `ports clean` — Kill Orphaned Ports

Scans for ports with no associated project, stale PIDs, or processes that have been idle/unresponsive.

```
  Scanning for orphaned ports...

  Found 2 orphaned ports:

  PORT     PROCESS   PID     REASON
  :8080    node      12345   No project detected, idle 2h+
  :4000    ruby      99001   Process unresponsive

  Kill all? [y/N]
```

- Each kill shows confirmation:
```
  ✓ Killed :8080 (PID 12345)
  ✓ Killed :4000 (PID 99001)

  2 ports cleaned.
```

---

## `ports clean <number>` — Kill Specific Port

```
  PORT     PROCESS   PID     PROJECT    FRAMEWORK   UPTIME   STATUS
  :3000    node      9558    git-weekly Next.js     21m 11s  ● healthy

  Kill process on :3000? [y/N]
```

On confirm:
```
  ✓ Killed :3000 (PID 9558)
```

---

## `ports watch` — Real-time Monitor

Refreshes the table in-place (full terminal repaint) when ports open or close.

```
┌─────────────────────────────────────────────────────────────────┐
│  🔊 Port Whisperer                       watching · Ctrl+C exit │
└─────────────────────────────────────────────────────────────────┘

  PORT     PROCESS   PID     PROJECT     FRAMEWORK   UPTIME     STATUS
  :3000    node      9558    git-weekly  Next.js     22m 4s     ● healthy
  :5432    docker    40827   postgres-1  PostgreSQL  3m 13s     ● healthy

  Last updated: 10:52:34 AM  ·  3 ports active
```

- Header box gains `watching · Ctrl+C exit` label on the right
- Table refreshes every 2 seconds
- New ports flash briefly in green on appear
- Closed ports flash briefly in red before disappearing
- Footer shows `Last updated: HH:MM:SS AM/PM`

---

## Colors & Typography

| Element | Color (ANSI) |
|---|---|
| Column headers | Cyan / `#00ffff` |
| Port numbers | Yellow / `#ffff00` |
| Project names | Magenta / Purple |
| Framework: Next.js | Cyan |
| Framework: PostgreSQL | Blue |
| Framework: Redis | Red |
| Uptime | Green |
| Status healthy | Green |
| Status unhealthy | Red |
| Dim separators / labels | Gray / dim |
| Kill hints - command | Cyan |
| Kill hints - PID | Red |

---

## Technical Notes

- Runtime: **Node.js** (ships as a global npm package: `npm i -g ports`)
- Port scanning: `lsof -i -P -n` or `/proc/net/tcp` on Linux
- Framework detection: inspect `package.json`, `Procfile`, container image name
- Project detection: resolve cwd from PID via `/proc/<pid>/cwd` (Linux) or `lsof +p` (macOS)
- Git branch: `git -C <dir> branch --show-current`
- Process tree: walk parent PIDs via `ps`
- Watch mode: polling interval 2s with terminal clear + redraw
- Install: single binary via `pkg` or distributed as npm global

---

## File Structure (planned)

```
port-ui/
├── docs/
│   └── design.md
├── src/
│   ├── index.ts          # CLI entry, command routing
│   ├── scanner.ts        # lsof / port scanning
│   ├── detector.ts       # framework + project detection
│   ├── renderer.ts       # table + detail view rendering
│   ├── watcher.ts        # watch mode loop
│   └── cleaner.ts        # orphan detection + kill logic
├── package.json
├── tsconfig.json
└── README.md
```

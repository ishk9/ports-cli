import { execSync } from 'child_process';
import * as path from 'path';
import { IPortScanner } from '../interfaces/IPortScanner';
import { PortEntry, RawPortRecord } from '../types';
import { ProjectDetector } from './ProjectDetector';
import { ProcessInspector } from './ProcessInspector';
import { DockerResolver } from './DockerResolver';
import { FrameworkDetectorRegistry } from '../strategies/framework/FrameworkDetectorRegistry';

const DEV_PROCESSES = new Set([
  'node', 'next-server', 'next', 'deno', 'bun',
  'python', 'python3', 'uvicorn', 'gunicorn', 'flask',
  'ruby', 'puma', 'thin', 'unicorn', 'rails',
  'java', 'gradle', 'mvn', 'spring',
  'go', 'air',
  'php', 'artisan',
  'cargo', 'rust-analyzer',
  'docker', 'com.docker.backend',
  'postgres', 'postgresql', 'redis-server', 'mysqld', 'mongod',
  'webpack', 'vite', 'parcel', 'esbuild',
  'ollama',
]);

const DOCKER_PROCESS_PATTERNS = ['docker', 'com.docker'];

interface ProcessStats {
  cpu: string;
  memory: string;
  uptime: string;
  startedAt: string | null;
}

export class PortScanner implements IPortScanner {
  private readonly projectDetector = new ProjectDetector();
  private readonly processInspector = new ProcessInspector();
  private readonly dockerResolver = new DockerResolver();
  private readonly frameworkRegistry = FrameworkDetectorRegistry.getInstance();

  async scan(devOnly: boolean): Promise<PortEntry[]> {
    const rawRecords = this.fetchListeningPorts();
    if (rawRecords.length === 0) return [];

    const uniquePids = [...new Set(rawRecords.map((r) => r.pid))];

    // Three batched calls — avoid N individual ps/lsof invocations
    const fullCommandMap = this.resolveFullCommandNames(uniquePids);
    const statsMap       = this.resolveProcessStats(uniquePids);
    const cwdMap         = this.projectDetector.getCwdBatch(uniquePids);

    const enrichedRecords = rawRecords.map((r) => ({
      ...r,
      command: fullCommandMap.get(r.pid) ?? r.command,
    }));

    const entries: PortEntry[] = enrichedRecords
      .filter((r) => !devOnly || this.isDevProcess(r.command))
      .map((r) => this.buildEntry(r, cwdMap, statsMap));

    return entries.sort((a, b) => a.port - b.port);
  }

  /**
   * Resolves CPU%, RSS memory, uptime, and start time for all PIDs in one ps call.
   * Format: pid=%cpu=,rss=,etime=,lstart=
   */
  private resolveProcessStats(pids: number[]): Map<number, ProcessStats> {
    const map = new Map<number, ProcessStats>();
    if (pids.length === 0) return map;

    try {
      const pidList = pids.join(',');
      // lstart is a long date string — must be last so etime stays parseable
      const raw = execSync(
        `ps -p ${pidList} -o pid=,%cpu=,rss=,etime=,lstart= 2>/dev/null`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
      );

      for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const parts = trimmed.split(/\s+/);
        if (parts.length < 4) continue;

        const pid    = parseInt(parts[0], 10);
        const cpuRaw = parseFloat(parts[1]);
        const rssKb  = parseInt(parts[2], 10);
        const etime  = parts[3];
        // lstart is everything after the first 4 tokens
        const lstart = parts.slice(4).join(' ') || null;

        map.set(pid, {
          cpu:       this.formatCpu(cpuRaw),
          memory:    this.formatMemory(rssKb),
          uptime:    this.parseEtime(etime),
          startedAt: lstart,
        });
      }
    } catch {
      // ps unavailable — entries will show '–'
    }

    return map;
  }

  private formatCpu(pct: number): string {
    return `${pct.toFixed(1)}%`;
  }

  private formatMemory(rssKb: number): string {
    if (rssKb >= 1024 * 1024) return `${(rssKb / 1024 / 1024).toFixed(1)} GB`;
    if (rssKb >= 1024)        return `${(rssKb / 1024).toFixed(1)} MB`;
    return `${rssKb} KB`;
  }

  private parseEtime(etime: string): string {
    const dayMatch = etime.match(/^(\d+)-(\d+):(\d+):(\d+)$/);
    if (dayMatch) {
      const [, d, h, m] = dayMatch;
      return `${d}d ${h}h ${m}m`;
    }
    const parts = etime.split(':').map(Number);
    if (parts.length === 3) {
      const [h, m, s] = parts;
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m ${s}s`;
    }
    if (parts.length === 2) {
      const [m, s] = parts;
      return `${m}m ${s}s`;
    }
    return etime;
  }

  /**
   * Resolves the full binary basename for each PID via a single ps call.
   */
  private resolveFullCommandNames(pids: number[]): Map<number, string> {
    const map = new Map<number, string>();
    if (pids.length === 0) return map;

    try {
      const pidList = pids.join(',');
      const raw = execSync(`ps -p ${pidList} -o pid=,comm= 2>/dev/null`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const spaceIdx = trimmed.indexOf(' ');
        if (spaceIdx === -1) continue;
        const pid = parseInt(trimmed.slice(0, spaceIdx), 10);
        const fullPath = trimmed.slice(spaceIdx + 1).trim();
        // Use just the basename of the full path
        map.set(pid, path.basename(fullPath));
      }
    } catch {
      // ps failed — fall back to lsof names
    }

    return map;
  }

  private fetchListeningPorts(): RawPortRecord[] {
    try {
      const raw = execSync('lsof -iTCP -sTCP:LISTEN -P -n 2>/dev/null', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const seen = new Set<string>();
      const records: RawPortRecord[] = [];

      for (const line of raw.split('\n').slice(1)) {
        const parsed = this.parseLsofLine(line);
        if (!parsed) continue;

        const key = `${parsed.pid}:${parsed.port}`;
        if (seen.has(key)) continue;
        seen.add(key);
        records.push(parsed);
      }

      return records;
    } catch {
      return [];
    }
  }

  private parseLsofLine(line: string): RawPortRecord | null {
    if (!line.trim()) return null;

    const match = line.match(/^(\S+)\s+(\d+)\s+\S+\s+\S+\s+\S+\s+\S+\s+\S+\s+\S+\s+.*?:(\d+)\s*/);
    if (!match) return null;

    return {
      command: match[1],
      pid: parseInt(match[2], 10),
      port: parseInt(match[3], 10),
    };
  }

  private buildEntry(
    record: RawPortRecord,
    cwdMap: Map<number, string>,
    statsMap: Map<number, ProcessStats>,
  ): PortEntry {
    const isDocker = this.isDockerProcess(record.command);

    const containerName = isDocker
      ? this.dockerResolver.getContainerName(record.port)
      : null;

    const cwd = isDocker ? null : (cwdMap.get(record.pid) ?? null);
    const projectInfo = this.projectDetector.resolve(cwd);

    const stats = statsMap.get(record.pid) ?? {
      cpu: '–', memory: '–', uptime: '–', startedAt: null,
    };

    const framework = this.frameworkRegistry.resolve(
      record.command,
      projectInfo.directory,
      containerName,
    );

    const project = containerName ?? projectInfo.project;
    const displayCommand = isDocker ? 'docker' : record.command;

    return {
      port: record.port,
      process: displayCommand,
      pid: record.pid,
      project,
      framework,
      cpu: stats.cpu,
      memory: stats.memory,
      uptime: stats.uptime,
      status: 'healthy',
      directory: projectInfo.directory,
      gitBranch: projectInfo.gitBranch,
      startedAt: stats.startedAt,
      isDevServer: this.isDevProcess(record.command),
    };
  }

  private isDockerProcess(command: string): boolean {
    const lower = command.toLowerCase();
    return DOCKER_PROCESS_PATTERNS.some((p) => lower.includes(p));
  }

  private isDevProcess(command: string): boolean {
    const lower = command.toLowerCase();
    // Strip version suffixes like "next-server (v16.1.6)" → "next-server"
    const baseName = lower.split(/[\s(]/)[0];
    if (DEV_PROCESSES.has(lower) || DEV_PROCESSES.has(baseName)) return true;
    if (this.isDockerProcess(lower)) return true;
    return false;
  }
}

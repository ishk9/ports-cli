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

export class PortScanner implements IPortScanner {
  private readonly projectDetector = new ProjectDetector();
  private readonly processInspector = new ProcessInspector();
  private readonly dockerResolver = new DockerResolver();
  private readonly frameworkRegistry = FrameworkDetectorRegistry.getInstance();

  async scan(devOnly: boolean): Promise<PortEntry[]> {
    const rawRecords = this.fetchListeningPorts();
    if (rawRecords.length === 0) return [];

    const uniquePids = [...new Set(rawRecords.map((r) => r.pid))];

    // Resolve full command names once (lsof truncates to 9 chars)
    const fullCommandMap = this.resolveFullCommandNames(uniquePids);

    // Apply full command names to records
    const enrichedRecords = rawRecords.map((r) => ({
      ...r,
      command: fullCommandMap.get(r.pid) ?? r.command,
    }));

    const cwdMap = this.projectDetector.getCwdBatch(uniquePids);

    const entries: PortEntry[] = enrichedRecords
      .filter((r) => !devOnly || this.isDevProcess(r.command))
      .map((r) => this.buildEntry(r, cwdMap));

    return entries.sort((a, b) => a.port - b.port);
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
  ): PortEntry {
    const isDocker = this.isDockerProcess(record.command);

    // For Docker processes, skip cwd-based project detection;
    // use the container name as project instead.
    const containerName = isDocker
      ? this.dockerResolver.getContainerName(record.port)
      : null;

    const cwd = isDocker ? null : (cwdMap.get(record.pid) ?? null);
    const projectInfo = this.projectDetector.resolve(cwd);
    const stats = this.processInspector.getStats(record.pid);

    const framework = this.frameworkRegistry.resolve(
      record.command,
      projectInfo.directory,
      containerName,
    );

    const project = containerName ?? projectInfo.project;

    // Display-friendly process name: for Docker, show "docker"
    const displayCommand = isDocker ? 'docker' : record.command;

    return {
      port: record.port,
      process: displayCommand,
      pid: record.pid,
      project,
      framework,
      uptime: stats.uptime,
      status: 'healthy',
      directory: projectInfo.directory,
      gitBranch: projectInfo.gitBranch,
      memory: stats.memory,
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
    if (DEV_PROCESSES.has(lower)) return true;
    if (this.isDockerProcess(lower)) return true;
    return false;
  }
}

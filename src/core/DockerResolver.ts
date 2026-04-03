import { execSync } from 'child_process';

interface ContainerInfo {
  name: string;
  ports: number[];
}

/**
 * Resolves Docker container names for ports managed by Docker.
 * Uses a single `docker ps` call and caches the result.
 */
export class DockerResolver {
  private cache: Map<number, string> | null = null;

  /**
   * Returns the container name for a given port, or null if not a Docker container.
   */
  getContainerName(port: number): string | null {
    const map = this.getPortToContainerMap();
    return map.get(port) ?? null;
  }

  private getPortToContainerMap(): Map<number, string> {
    if (this.cache !== null) return this.cache;

    this.cache = new Map();

    try {
      const raw = execSync(
        `docker ps --format "{{.Names}}\\t{{.Ports}}" 2>/dev/null`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
      );

      for (const line of raw.split('\n')) {
        const [name, portsStr] = line.split('\t');
        if (!name || !portsStr) continue;
        for (const container of this.parseContainerPorts(name.trim(), portsStr.trim())) {
          for (const p of container.ports) {
            this.cache.set(p, container.name);
          }
        }
      }
    } catch {
      // Docker not available or not running
    }

    return this.cache;
  }

  private parseContainerPorts(name: string, portsStr: string): ContainerInfo[] {
    const ports: number[] = [];
    // Matches: 0.0.0.0:5432->5432/tcp  or  :::6379->6379/tcp
    const regex = /(?:[\d.]+|::):(\d+)->/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(portsStr)) !== null) {
      ports.push(parseInt(match[1], 10));
    }
    return [{ name, ports }];
  }
}

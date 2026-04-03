export interface PortEntry {
  port: number;
  process: string;
  pid: number;
  project: string | null;
  framework: FrameworkInfo | null;
  uptime: string;
  status: 'healthy' | 'unhealthy';
  directory: string | null;
  gitBranch: string | null;
  memory: string | null;
  startedAt: string | null;
  isDevServer: boolean;
}

export interface ProcessNode {
  pid: number;
  command: string;
  ppid: number;
}

export interface OrphanEntry extends PortEntry {
  orphanReason: string;
}

export type FrameworkColorKey =
  | 'cyan'
  | 'blue'
  | 'red'
  | 'green'
  | 'magenta'
  | 'yellow'
  | 'white';

export interface FrameworkInfo {
  name: string;
  color: FrameworkColorKey;
}

export interface RawPortRecord {
  command: string;
  pid: number;
  port: number;
}

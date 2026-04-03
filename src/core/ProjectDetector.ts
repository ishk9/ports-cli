import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

interface ProjectInfo {
  directory: string | null;
  project: string | null;
  gitBranch: string | null;
  version: string | null;
}

export class ProjectDetector {
  /**
   * Resolves the working directory of a process using lsof.
   * Batches multiple PIDs in a single lsof call for performance.
   */
  getCwdBatch(pids: number[]): Map<number, string> {
    const result = new Map<number, string>();
    if (pids.length === 0) return result;

    try {
      const pidList = pids.join(',');
      const raw = execSync(
        `lsof -p ${pidList} -a -d cwd -F pn 2>/dev/null`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
      );

      let currentPid: number | null = null;
      for (const line of raw.split('\n')) {
        if (line.startsWith('p')) {
          currentPid = parseInt(line.slice(1), 10);
        } else if (line.startsWith('n') && currentPid !== null) {
          result.set(currentPid, line.slice(1));
        }
      }
    } catch {
      // lsof unavailable or permission denied — gracefully degrade
    }

    return result;
  }

  /**
   * Enriches a cwd path with project name, git branch, and package version.
   */
  resolve(cwd: string | null): ProjectInfo {
    if (!cwd) {
      return { directory: null, project: null, gitBranch: null, version: null };
    }

    const project = this.detectProjectName(cwd);
    const gitBranch = this.getGitBranch(cwd);
    const version = this.getPackageVersion(cwd);

    return { directory: cwd, project, gitBranch, version };
  }

  private detectProjectName(cwd: string): string | null {
    // Prefer package.json name, fall back to directory basename
    const pkgPath = path.join(cwd, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (typeof pkg.name === 'string' && pkg.name.trim()) {
          return pkg.name.trim();
        }
      } catch {
        // malformed package.json
      }
    }

    return path.basename(cwd) || null;
  }

  private getGitBranch(cwd: string): string | null {
    try {
      const branch = execSync(`git -C "${cwd}" branch --show-current 2>/dev/null`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();
      return branch || null;
    } catch {
      return null;
    }
  }

  private getPackageVersion(cwd: string): string | null {
    const pkgPath = path.join(cwd, 'package.json');
    if (!fs.existsSync(pkgPath)) return null;
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return typeof pkg.version === 'string' ? pkg.version : null;
    } catch {
      return null;
    }
  }
}

interface ProjectInfo {
    directory: string | null;
    project: string | null;
    gitBranch: string | null;
    version: string | null;
}
export declare class ProjectDetector {
    /**
     * Resolves the working directory of a process using lsof.
     * Batches multiple PIDs in a single lsof call for performance.
     */
    getCwdBatch(pids: number[]): Map<number, string>;
    /**
     * Enriches a cwd path with project name, git branch, and package version.
     */
    resolve(cwd: string | null): ProjectInfo;
    private detectProjectName;
    private getGitBranch;
    private getPackageVersion;
}
export {};
//# sourceMappingURL=ProjectDetector.d.ts.map
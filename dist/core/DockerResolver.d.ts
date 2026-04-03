/**
 * Resolves Docker container names for ports managed by Docker.
 * Uses a single `docker ps` call and caches the result.
 */
export declare class DockerResolver {
    private cache;
    /**
     * Returns the container name for a given port, or null if not a Docker container.
     */
    getContainerName(port: number): string | null;
    private getPortToContainerMap;
    private parseContainerPorts;
}
//# sourceMappingURL=DockerResolver.d.ts.map
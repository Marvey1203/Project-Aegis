export declare function findProjectRoot(): string;
/**
 * Resolves a file path provided by the agent to an absolute path on the host machine.
 * This is security-critical and ensures the agent cannot access files outside the project.
 */
export declare function resolveToolPath(filePath: string): string;

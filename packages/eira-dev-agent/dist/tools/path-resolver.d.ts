/**
 * Resolves a file path by always joining it from the true project root,
 * which is determined by locating the `pnpm-workspace.yaml` file.
 * This makes the tool's behavior independent of the current working directory.
 */
export declare function resolveToolPath(filePath: string): string;

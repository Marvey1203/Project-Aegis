import path from "path";
import fs from "fs";

// Cache the project root to avoid repeated lookups
let projectRoot: string | undefined;

function findProjectRoot(): string {
  if (projectRoot) return projectRoot;

  let currentPath = process.cwd();
  // The start script runs from within eira-dev-agent, so we start there.
  
  while (true) {
    const workspaceFile = path.join(currentPath, 'pnpm-workspace.yaml');
    if (fs.existsSync(workspaceFile)) {
      projectRoot = currentPath;
      return projectRoot;
    }
    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      // Fallback if we can't find the workspace file, though this shouldn't happen.
      throw new Error("Could not find project root containing 'pnpm-workspace.yaml'");
    }
    currentPath = parentPath;
  }
}

/**
 * Resolves a file path by always joining it from the true project root,
 * which is determined by locating the `pnpm-workspace.yaml` file.
 * This makes the tool's behavior independent of the current working directory.
 */
export function resolveToolPath(filePath: string): string {
  const root = findProjectRoot();
  return path.join(root, filePath);
}
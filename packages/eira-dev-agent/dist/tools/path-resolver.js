// src/tools/path-resolver.ts
import path from "path";
import fs from "fs";
// Cache the project root to avoid repeated lookups
let projectRootCache;
export function findProjectRoot() {
    if (projectRootCache)
        return projectRootCache;
    let currentPath = process.cwd();
    while (currentPath !== path.dirname(currentPath)) {
        if (fs.existsSync(path.join(currentPath, 'pnpm-workspace.yaml'))) {
            projectRootCache = currentPath;
            return projectRootCache;
        }
        currentPath = path.dirname(currentPath);
    }
    throw new Error("Could not find project root containing 'pnpm-workspace.yaml'.");
}
/**
 * Resolves a file path provided by the agent to an absolute path on the host machine.
 * This is security-critical and ensures the agent cannot access files outside the project.
 */
export function resolveToolPath(filePath) {
    const root = findProjectRoot();
    // --- Security Sanitization ---
    if (filePath.includes('..')) {
        throw new Error("Path traversal ('..') is not allowed.");
    }
    // Normalize the path to remove any leading slashes and ensure consistent format.
    const sanitizedPath = path.normalize(filePath.startsWith('/') || filePath.startsWith('\\') ? filePath.substring(1) : filePath);
    // Always resolve the path from the project root. This is the single source of truth.
    const absolutePath = path.join(root, sanitizedPath);
    return absolutePath;
}

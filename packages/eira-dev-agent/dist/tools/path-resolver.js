"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveToolPath = resolveToolPath;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Cache the project root to avoid repeated lookups
let projectRoot;
function findProjectRoot() {
    if (projectRoot)
        return projectRoot;
    let currentPath = process.cwd();
    // The start script runs from within eira-dev-agent, so we start there.
    while (true) {
        const workspaceFile = path_1.default.join(currentPath, 'pnpm-workspace.yaml');
        if (fs_1.default.existsSync(workspaceFile)) {
            projectRoot = currentPath;
            return projectRoot;
        }
        const parentPath = path_1.default.dirname(currentPath);
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
function resolveToolPath(filePath) {
    const root = findProjectRoot();
    return path_1.default.join(root, filePath);
}

"use strict";
// src/tools/path-resolver.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProjectRoot = findProjectRoot;
exports.resolveToolPath = resolveToolPath;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Cache the project root to avoid repeated lookups
let projectRootCache;
function findProjectRoot() {
    if (projectRootCache)
        return projectRootCache;
    let currentPath = process.cwd();
    while (currentPath !== path_1.default.dirname(currentPath)) {
        if (fs_1.default.existsSync(path_1.default.join(currentPath, 'pnpm-workspace.yaml'))) {
            projectRootCache = currentPath;
            return projectRootCache;
        }
        currentPath = path_1.default.dirname(currentPath);
    }
    throw new Error("Could not find project root containing 'pnpm-workspace.yaml'.");
}
/**
 * Resolves a file path provided by the agent to an absolute path on the host machine.
 * This is security-critical and ensures the agent cannot access files outside the project.
 */
function resolveToolPath(filePath) {
    const root = findProjectRoot();
    // --- Security Sanitization ---
    if (filePath.includes('..')) {
        throw new Error("Path traversal ('..') is not allowed.");
    }
    // Normalize the path to remove any leading slashes and ensure consistent format.
    const sanitizedPath = path_1.default.normalize(filePath.startsWith('/') || filePath.startsWith('\\') ? filePath.substring(1) : filePath);
    // Always resolve the path from the project root. This is the single source of truth.
    const absolutePath = path_1.default.join(root, sanitizedPath);
    return absolutePath;
}

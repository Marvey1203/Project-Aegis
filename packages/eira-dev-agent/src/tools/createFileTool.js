"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFileTool = void 0;
// packages/eira-dev-agent/src/tools/createFileTool.ts
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const tools_1 = require("@langchain/core/tools");
const path_resolver_1 = require("./path-resolver"); // <-- Use helper
const createFileSchema = zod_1.z.object({
    filePath: zod_1.z.string().describe("The relative path for the new file to be created (e.g., 'core/src/new-module.ts')."),
    content: zod_1.z.string().optional().describe("Optional initial content to write into the new file."),
});
async function createFileLogic({ filePath, content = '' }) {
    try {
        const resolvedPath = (0, path_resolver_1.resolveToolPath)(filePath);
        try {
            await fs_1.promises.access(resolvedPath);
            return `Error: File already exists at ${resolvedPath}. Use writeFileTool to modify an existing file.`;
        }
        catch (error) {
            // File does not exist, proceed.
        }
        const dir = path_1.default.dirname(resolvedPath);
        await fs_1.promises.mkdir(dir, { recursive: true });
        await fs_1.promises.writeFile(resolvedPath, content, "utf-8");
        return `Successfully created new file at ${resolvedPath}.`;
    }
    catch (err) {
        return `Error creating file at path "${filePath}": ${err instanceof Error ? err.message : String(err)}`;
    }
}
exports.createFileTool = new tools_1.DynamicStructuredTool({
    name: "createFileTool",
    description: "Creates a new code file at a specified path with optional initial content. This tool will fail if the file already exists.",
    schema: createFileSchema,
    func: createFileLogic,
});

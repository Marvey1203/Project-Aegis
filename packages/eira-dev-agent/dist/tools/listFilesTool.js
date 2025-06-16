"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFilesTool = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const tools_1 = require("@langchain/core/tools");
const path_resolver_1 = require("./path-resolver");
const schema = zod_1.z.object({
    directoryPath: zod_1.z.string().describe("The relative path of the directory to inspect (e.g., 'core/src')."),
});
async function logic({ directoryPath }) {
    try {
        const resolvedPath = (0, path_resolver_1.resolveToolPath)(directoryPath);
        async function generateFileTree(dir, indent) {
            const entries = await fs_1.promises.readdir(dir, { withFileTypes: true });
            let tree = "";
            for (const entry of entries) {
                if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git')
                    continue;
                tree += `${indent}├── ${entry.name}\n`;
                if (entry.isDirectory()) {
                    tree += await generateFileTree(path_1.default.join(dir, entry.name), `${indent}│   `);
                }
            }
            return tree;
        }
        return await generateFileTree(resolvedPath, "") || "Directory is empty.";
    }
    catch (err) {
        return `Error listing files: ${err instanceof Error ? err.message : String(err)}`;
    }
}
exports.listFilesTool = new tools_1.DynamicStructuredTool({
    name: "listFilesTool",
    description: "Recursively lists all files and subdirectories within a given directory path.",
    schema,
    func: logic,
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFileTool = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const tools_1 = require("@langchain/core/tools");
const path_resolver_1 = require("./path-resolver");
const schema = zod_1.z.object({
    filePath: zod_1.z.string().describe("The path of the file to write to."),
    content: zod_1.z.string().describe("The new content for the file."),
});
async function logic({ filePath, content }) {
    try {
        const resolvedPath = (0, path_resolver_1.resolveToolPath)(filePath);
        await fs_1.promises.mkdir(path_1.default.dirname(resolvedPath), { recursive: true });
        await fs_1.promises.writeFile(resolvedPath, content, "utf-8");
        return `Successfully wrote to ${filePath}`;
    }
    catch (err) {
        return `Error writing file: ${err instanceof Error ? err.message : String(err)}`;
    }
}
exports.writeFileTool = new tools_1.DynamicStructuredTool({
    name: "writeFileTool",
    description: "Writes content to a file, overwriting it if it exists.",
    schema,
    func: logic,
});

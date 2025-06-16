"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFilesTool = void 0;
const fs_1 = require("fs");
const zod_1 = require("zod");
const tools_1 = require("@langchain/core/tools");
const path_resolver_1 = require("./path-resolver");
const schema = zod_1.z.object({
    filePaths: zod_1.z.array(zod_1.z.string()).describe("An array of relative paths to files to read."),
});
async function logic({ filePaths }) {
    const contents = await Promise.all(filePaths.map(async (filePath) => {
        try {
            const resolvedPath = (0, path_resolver_1.resolveToolPath)(filePath);
            const content = await fs_1.promises.readFile(resolvedPath, "utf-8");
            return `--- FILE: ${filePath} ---\n${content}\n--- END OF FILE: ${filePath} ---`;
        }
        catch (err) {
            return `--- ERROR READING FILE: ${filePath} ---\n${err instanceof Error ? err.message : String(err)}`;
        }
    }));
    return contents.join("\n\n");
}
exports.readFilesTool = new tools_1.DynamicStructuredTool({
    name: "readFilesTool",
    description: "Reads the contents of multiple files from a list of paths.",
    schema,
    func: logic,
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentDirectoryTool = void 0;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
exports.getCurrentDirectoryTool = new tools_1.DynamicStructuredTool({
    name: "getCurrentDirectoryTool",
    description: "Returns the current working directory of the process. This is useful for orienting the agent and resolving relative file paths.",
    schema: zod_1.z.object({}), // No arguments needed
    func: async () => {
        try {
            return `The current working directory is: ${process.cwd()}`;
        }
        catch (e) {
            return `Error getting current directory: ${e.message}`;
        }
    },
});

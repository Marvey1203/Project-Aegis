"use strict";
// src/tools/findAndReplaceInFileTool.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAndReplaceInFileTool = void 0;
const zod_1 = require("zod");
const tools_1 = require("@langchain/core/tools");
const axios_1 = __importDefault(require("axios"));
const findAndReplaceSchema = zod_1.z.object({
    filePath: zod_1.z.string().describe("The relative path of the file to be modified (e.g., 'src/components/myComponent.tsx')."),
    find: zod_1.z.string().describe("The exact string to search for."),
    replace: zod_1.z.string().describe("The string that will replace all occurrences of the 'find' string."),
});
exports.findAndReplaceInFileTool = new tools_1.DynamicStructuredTool({
    name: "findAndReplaceInFileTool",
    description: "Finds and replaces all occurrences of a string in a file via the Eira file server. This is for simple text replacement only.",
    schema: findAndReplaceSchema,
    func: async ({ filePath, find, replace }) => {
        // Note: The complex JSONPath logic has been removed as it's better handled
        // by a combination of read, modify (in agent's head), and write tools.
        // This tool is now for simple, global text replacement.
        const serverUrl = 'http://localhost:3001/api/findAndReplace';
        try {
            const response = await axios_1.default.post(serverUrl, { filePath, find, replace });
            if (response.data.success) {
                return response.data.message || "Successfully performed find and replace.";
            }
            else {
                return `Error from file server: ${response.data.error}`;
            }
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                return `Error from file server: ${error.response.data.error || error.message}`;
            }
            return `Failed to connect to Eira file server at ${serverUrl}. Is it running?`;
        }
    },
});

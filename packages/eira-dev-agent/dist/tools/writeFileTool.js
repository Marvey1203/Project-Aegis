"use strict";
// src/tools/writeFileTool.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFileTool = void 0;
const zod_1 = require("zod");
const tools_1 = require("@langchain/core/tools");
const axios_1 = __importDefault(require("axios"));
const schema = zod_1.z.object({
    filePath: zod_1.z.string().describe("The relative path of the file to write to."),
    content: zod_1.z.string().describe("The new content for the file."),
});
exports.writeFileTool = new tools_1.DynamicStructuredTool({
    name: "writeFileTool",
    description: "Writes content to a file via the Eira file server, overwriting the file if it already exists.",
    schema,
    func: async ({ filePath, content }) => {
        const serverUrl = "http://localhost:3001/api/writeFile";
        try {
            const response = await axios_1.default.post(serverUrl, { filePath, content });
            if (response.data.success) {
                return response.data.message || "Successfully wrote to file.";
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

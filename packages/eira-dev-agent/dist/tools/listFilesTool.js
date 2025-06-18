"use strict";
// src/tools/listFilesTool.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFilesTool = void 0;
const zod_1 = require("zod");
const tools_1 = require("@langchain/core/tools");
const axios_1 = __importDefault(require("axios"));
const schema = zod_1.z.object({
    directoryPath: zod_1.z.string().describe("The relative path of the directory to inspect (e.g., 'src/' or '.'). Defaults to the current directory if empty."),
});
exports.listFilesTool = new tools_1.DynamicStructuredTool({
    name: "listFilesTool",
    description: "Lists all files and subdirectories within a given directory path via the Eira file server.",
    schema,
    func: async ({ directoryPath }) => {
        const serverUrl = 'http://localhost:3001/api/listFiles';
        try {
            const response = await axios_1.default.post(serverUrl, { directoryPath });
            if (response.data.success) {
                return response.data.files.join('\n') || "Directory is empty.";
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

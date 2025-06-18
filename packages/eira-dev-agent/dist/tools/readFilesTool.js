"use strict";
// src/tools/readFilesTool.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFilesTool = void 0;
const zod_1 = require("zod");
const tools_1 = require("@langchain/core/tools");
const axios_1 = __importDefault(require("axios"));
const readFilesSchema = zod_1.z.object({
    filePaths: zod_1.z
        .array(zod_1.z.string())
        .describe("An array of relative paths to files to read."),
});
exports.readFilesTool = new tools_1.DynamicStructuredTool({
    name: "readFilesTool",
    description: "Reads the contents of one or more files from the local file system via the Eira file server.",
    schema: readFilesSchema,
    func: async ({ filePaths }) => {
        const serverUrl = "http://localhost:3001/api/readFiles";
        try {
            // The server now handles multiple files in one call
            const response = await axios_1.default.post(serverUrl, { filePaths });
            if (response.data.success) {
                // Format the response from the server which contains an array of file contents
                return response.data.files
                    .map((file) => `--- FILE: ${file.filePath} ---\n${file.content}\n--- END OF FILE: ${file.filePath} ---`)
                    .join("\n\n");
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

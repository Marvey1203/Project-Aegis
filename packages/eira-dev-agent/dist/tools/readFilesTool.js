// src/tools/readFilesTool.ts
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import axios from "axios";
const readFilesSchema = z.object({
    filePaths: z
        .array(z.string())
        .describe("An array of relative paths to files to read."),
});
export const readFilesTool = new DynamicStructuredTool({
    name: "readFilesTool",
    description: "Reads the contents of one or more files from the local file system via the Eira file server.",
    schema: readFilesSchema,
    func: async ({ filePaths }) => {
        const serverUrl = "http://localhost:3001/api/readFiles";
        try {
            // The server now handles multiple files in one call
            const response = await axios.post(serverUrl, { filePaths });
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
            if (axios.isAxiosError(error) && error.response) {
                return `Error from file server: ${error.response.data.error || error.message}`;
            }
            return `Failed to connect to Eira file server at ${serverUrl}. Is it running?`;
        }
    },
});

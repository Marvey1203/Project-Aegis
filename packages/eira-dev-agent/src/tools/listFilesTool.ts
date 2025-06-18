// src/tools/listFilesTool.ts

import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import axios from 'axios';

const schema = z.object({
  directoryPath: z.string().describe("The relative path of the directory to inspect (e.g., 'src/' or '.'). Defaults to the current directory if empty."),
});

export const listFilesTool = new DynamicStructuredTool({
  name: "listFilesTool",
  description: "Lists all files and subdirectories within a given directory path via the Eira file server.",
  schema,
  func: async ({ directoryPath }) => {
    const serverUrl = 'http://localhost:3001/api/listFiles';
    try {
        const response = await axios.post(serverUrl, { directoryPath });
        if (response.data.success) {
            return response.data.files.join('\n') || "Directory is empty.";
        } else {
            return `Error from file server: ${response.data.error}`;
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            return `Error from file server: ${error.response.data.error || error.message}`;
        }
        return `Failed to connect to Eira file server at ${serverUrl}. Is it running?`;
    }
  },
});
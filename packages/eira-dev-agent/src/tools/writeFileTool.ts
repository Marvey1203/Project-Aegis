// src/tools/writeFileTool.ts

import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import axios from "axios";

const schema = z.object({
  filePath: z.string().describe("The relative path of the file to write to."),
  content: z.string().describe("The new content for the file."),
});

export const writeFileTool = new DynamicStructuredTool({
  name: "writeFileTool",
  description: "Writes content to a file via the Eira file server, overwriting the file if it already exists.",
  schema,
  func: async ({ filePath, content }) => {
    const serverUrl = "http://localhost:3001/api/writeFile";
    try {
      const response = await axios.post(serverUrl, { filePath, content });
      if (response.data.success) {
        return response.data.message || "Successfully wrote to file.";
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
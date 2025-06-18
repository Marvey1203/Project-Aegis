// src/tools/findAndReplaceInFileTool.ts

import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import axios from 'axios';

const findAndReplaceSchema = z.object({
  filePath: z.string().describe("The relative path of the file to be modified (e.g., 'src/components/myComponent.tsx')."),
  find: z.string().describe("The exact string to search for."),
  replace: z.string().describe("The string that will replace all occurrences of the 'find' string."),
});

export const findAndReplaceInFileTool = new DynamicStructuredTool({
  name: "findAndReplaceInFileTool",
  description: "Finds and replaces all occurrences of a string in a file via the Eira file server. This is for simple text replacement only.",
  schema: findAndReplaceSchema,
  func: async ({ filePath, find, replace }) => {
    // Note: The complex JSONPath logic has been removed as it's better handled
    // by a combination of read, modify (in agent's head), and write tools.
    // This tool is now for simple, global text replacement.
    const serverUrl = 'http://localhost:3001/api/findAndReplace';
    try {
      const response = await axios.post(serverUrl, { filePath, find, replace });
      if (response.data.success) {
        return response.data.message || "Successfully performed find and replace.";
      } else {
        return `Error from file server: ${response.data.error}`;
      }
    } catch (error: any)      {
      if (axios.isAxiosError(error) && error.response) {
        return `Error from file server: ${error.response.data.error || error.message}`;
      }
      return `Failed to connect to Eira file server at ${serverUrl}. Is it running?`;
    }
  },
});
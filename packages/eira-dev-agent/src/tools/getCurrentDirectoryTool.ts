import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const getCurrentDirectoryTool = new DynamicStructuredTool({
  name: "getCurrentDirectoryTool",
  description: "Returns the current working directory of the process. This is useful for orienting the agent and resolving relative file paths.",
  schema: z.object({}), // No arguments needed
  func: async () => {
    try {
      return `The current working directory is: ${process.cwd()}`;
    } catch (e: any) {
      return `Error getting current directory: ${e.message}`;
    }
  },
});
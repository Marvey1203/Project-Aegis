// packages/eira-dev-agent/src/tools/createFileTool.ts
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { resolveToolPath } from "./path-resolver"; // <-- Use helper

const createFileSchema = z.object({
  filePath: z.string().describe("The relative path for the new file to be created (e.g., 'core/src/new-module.ts')."),
  content: z.string().optional().describe("Optional initial content to write into the new file."),
});

async function createFileLogic({ filePath, content = '' }: z.infer<typeof createFileSchema>): Promise<string> {
  try {
    const resolvedPath = resolveToolPath(filePath);

    try {
      await fs.access(resolvedPath);
      return `Error: File already exists at ${resolvedPath}. Use writeFileTool to modify an existing file.`;
    } catch (error) {
      // File does not exist, proceed.
    }

    const dir = path.dirname(resolvedPath);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(resolvedPath, content, "utf-8");
    return `Successfully created new file at ${resolvedPath}.`;
  } catch (err) {
    return `Error creating file at path "${filePath}": ${err instanceof Error ? err.message : String(err)}`;
  }
}

export const createFileTool = new DynamicStructuredTool({
  name: "createFileTool",
  description: "Creates a new code file at a specified path with optional initial content. This tool will fail if the file already exists.",
  schema: createFileSchema,
  func: createFileLogic,
});
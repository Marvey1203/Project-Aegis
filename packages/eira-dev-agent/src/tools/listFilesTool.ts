import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { resolveToolPath } from "./path-resolver";

const schema = z.object({
  directoryPath: z.string().describe("The relative path of the directory to inspect (e.g., 'core/src')."),
});

async function logic({ directoryPath }: z.infer<typeof schema>): Promise<string> {
  try {
    const resolvedPath = resolveToolPath(directoryPath);
    async function generateFileTree(dir: string, indent: string): Promise<string> {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      let tree = "";
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
        tree += `${indent}├── ${entry.name}\n`;
        if (entry.isDirectory()) {
          tree += await generateFileTree(path.join(dir, entry.name), `${indent}│   `);
        }
      }
      return tree;
    }
    return await generateFileTree(resolvedPath, "") || "Directory is empty.";
  } catch (err) {
    return `Error listing files: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export const listFilesTool = new DynamicStructuredTool({
  name: "listFilesTool",
  description: "Recursively lists all files and subdirectories within a given directory path.",
  schema,
  func: logic,
});
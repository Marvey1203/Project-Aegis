import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { resolveToolPath } from "./path-resolver";

const schema = z.object({
  filePath: z.string().describe("The path of the file to write to."),
  content: z.string().describe("The new content for the file."),
});

async function logic({ filePath, content }: z.infer<typeof schema>): Promise<string> {
  try {
    const resolvedPath = resolveToolPath(filePath);
    await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
    await fs.writeFile(resolvedPath, content, "utf-8");
    return `Successfully wrote to ${filePath}`;
  } catch (err) {
    return `Error writing file: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export const writeFileTool = new DynamicStructuredTool({
  name: "writeFileTool",
  description: "Writes content to a file, overwriting it if it exists.",
  schema,
  func: logic,
});
import { promises as fs } from "fs";
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { resolveToolPath } from "./path-resolver";

const schema = z.object({
  filePaths: z.array(z.string()).describe("An array of relative paths to files to read."),
});

async function logic({ filePaths }: z.infer<typeof schema>): Promise<string> {
  const contents = await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        const resolvedPath = resolveToolPath(filePath);
        const content = await fs.readFile(resolvedPath, "utf-8");
        return `--- FILE: ${filePath} ---\n${content}\n--- END OF FILE: ${filePath} ---`;
      } catch (err) {
        return `--- ERROR READING FILE: ${filePath} ---\n${err instanceof Error ? err.message : String(err)}`;
      }
    })
  );
  return contents.join("\n\n");
}

export const readFilesTool = new DynamicStructuredTool({
  name: "readFilesTool",
  description: "Reads the contents of multiple files from a list of paths.",
  schema,
  func: logic,
});
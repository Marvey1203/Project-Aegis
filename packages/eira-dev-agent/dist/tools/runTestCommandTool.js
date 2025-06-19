// packages/eira-dev-agent/src/tools/runTestCommandTool.ts
import { exec } from "child_process";
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
// 1. Define the input schema.
const runTestSchema = z.object({
    command: z.string().optional().describe("The specific test command to run. If not provided, the default project-wide test command 'pnpm test' will be used."),
});
// 2. Create the core logic for the tool.
async function runTestLogic({ command = "pnpm test" }) {
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            // 3. The tool *always* resolves successfully with the test results.
            // A non-zero exit code is a test failure, not a tool failure.
            const exitCode = error?.code ?? 0;
            // 4. Format the output clearly for the LLM.
            const result = `
--- TEST RESULTS ---
Exit Code: ${exitCode}

--- STDOUT ---
${stdout || "No stdout."}

--- STDERR ---
${stderr || "No stderr."}
--- END OF TEST RESULTS ---
      `;
            resolve(result);
        });
    });
}
// 5. Export the fully configured DynamicStructuredTool.
export const runTestCommandTool = new DynamicStructuredTool({
    name: "runTestCommandTool",
    description: "Executes a test command in the terminal and returns the exit code, stdout, and stderr. Use this to verify code changes and check for regressions. A non-zero exit code indicates a test failure.",
    schema: runTestSchema,
    func: runTestLogic,
});

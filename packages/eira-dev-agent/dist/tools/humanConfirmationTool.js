// src/tools/humanConfirmationTool.ts
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
export const humanConfirmationTool = new DynamicStructuredTool({
    name: "humanConfirmationTool",
    description: "Call this tool when you have a complete plan and need the user's confirmation before proceeding with execution. This will pause the execution and wait for human input. The plan MUST be fully described in the text part of your response before calling this tool.",
    schema: z.object({
        planSummary: z.string().describe("A brief, one-sentence summary of the plan that requires confirmation."),
    }),
    func: async () => {
        // This tool's function is simply to act as a signal. 
        // It returns a message indicating its purpose.
        return "Confirmation requested. Pausing for human input.";
    },
});

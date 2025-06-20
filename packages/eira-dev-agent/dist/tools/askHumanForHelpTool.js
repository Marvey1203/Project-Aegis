// src/tools/askHumanForHelpTool.ts
import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
const askHumanForHelpSchema = z.object({
    question: z.string().describe("The specific, clear question you need to ask the human to resolve your current situation or get approval."),
    context: z.string().optional().describe("Optional additional context the agent can provide to the human, such as the current task, file being worked on, or a summary of why help is needed."),
});
export const askHumanForHelpTool = new DynamicStructuredTool({
    name: "askHumanForHelpTool",
    description: "Asks a human user for help, clarification, instructions, or a decision. Use this when you are stuck, unsure how to proceed, encounter an ambiguous situation, or require input that needs human judgment. This tool will PAUSE your execution and wait for a direct human response.",
    schema: askHumanForHelpSchema,
    func: async () => {
        // This function's output is not used. Its call is a signal for the graph to stop.
        // The CLI will extract the 'question' and 'context' from the tool_call arguments.
        return "Pausing for human input. The user will be prompted to respond.";
    },
});

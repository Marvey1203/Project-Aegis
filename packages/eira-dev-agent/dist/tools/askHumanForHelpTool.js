"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askHumanForHelpTool = void 0;
const zod_1 = require("zod");
const tools_1 = require("@langchain/core/tools");
const askHumanForHelpSchema = zod_1.z.object({
    question: zod_1.z.string().describe("The specific question or prompt the agent wants to ask the human. This should be clear and provide enough context for the human to understand the request."),
    context: zod_1.z.string().optional().describe("Optional additional context the agent can provide to the human, such as the current task, file being worked on, or a summary of why help is needed."),
});
exports.askHumanForHelpTool = new tools_1.DynamicStructuredTool({
    name: "askHumanForHelpTool",
    description: "Asks a human user for help, clarification, instructions, or a decision. Use this when you are stuck, unsure how to proceed, encounter an ambiguous situation, or require input that needs human judgment. Formulate a clear and concise question for the human, providing necessary context if available.",
    schema: askHumanForHelpSchema,
    func: async (args) => {
        let promptString = `Question: ${args.question}`;
        if (args.context) {
            promptString += `\nContext: ${args.context}`;
        }
        return promptString;
    },
});

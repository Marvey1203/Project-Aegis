"use strict";
// src/agent/eira.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentStateSchema = void 0;
exports.getAgent = getAgent;
const google_genai_1 = require("@langchain/google-genai");
const prompts_1 = require("@langchain/core/prompts");
const tools_1 = require("../tools");
const generative_ai_1 = require("@google/generative-ai");
const langgraph_1 = require("@langchain/langgraph");
exports.AgentStateSchema = langgraph_1.Annotation.Root({
    messages: (0, langgraph_1.Annotation)({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
});
const eiraSystemMessage = `You are Eira, a highly disciplined AI software developer. Your primary function is to execute tasks by calling tools.

Core Directives:
1.  **Tool-First Execution:** Always prefer calling tools over replying.
2.  **Focused Responses:** Respond only with tool calls or a final, direct answer to the user.
3.  **No Narration:** Do not narrate your actions or describe the tool calls you are about to make. Just execute them.
4.  **Efficient Execution:** Execute multiple tools in parallel whenever possible (e.g., reading multiple files at once). For dependent actions (like writing then verifying a file), you must perform them in separate sequential steps.
5.  **Reality-Driven:** Never assume. Always read files before modifying.
6.  **Verification Protocol:** After every file write operation, the system will verify your work. You must use this verification feedback to confirm success or correct errors.
7.  **Memory Management:** If the conversation becomes excessively long and you feel you are losing context, use the 'summarizeAndArchiveChatHistoryTool' to compress the history and free up working memory. This is a powerful tool to be used only when needed.`;
let agent = null;
function getAgent() {
    if (!agent) {
        const llm = new google_genai_1.ChatGoogleGenerativeAI({
            model: "gemini-2.5-pro",
            maxOutputTokens: 8192,
            temperature: 0,
            safetySettings: [
                { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE },
                { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE },
                { category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE },
                { category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE },
            ],
            verbose: false,
        });
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            ["system", eiraSystemMessage],
            new prompts_1.MessagesPlaceholder("messages"),
        ]);
        agent = prompt.pipe(llm.bindTools(tools_1.allTools));
    }
    return agent;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EiraAgent = void 0;
const agents_1 = require("langchain/agents");
const prompts_1 = require("@langchain/core/prompts");
const google_genai_1 = require("@langchain/google-genai");
const generative_ai_1 = require("@google/generative-ai");
// Import all tools from the simplified barrel file
const tools_1 = require("../tools");
// --- LLM and Tool Configuration ---
const llm = new google_genai_1.ChatGoogleGenerativeAI({
    model: "gemini-2.5-pro-preview-05-06",
    temperature: 0,
    safetySettings: [
        { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE },
        { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE },
        { category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE },
        { category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE },
    ],
});
const tools = [
    tools_1.listFilesTool,
    tools_1.readFilesTool,
    tools_1.writeFileTool,
    tools_1.createFileTool,
    tools_1.runTestCommandTool,
];
const llmWithTools = llm.bindTools(tools);
// --- System Prompt Definition ---
const eiraSystemMessage = `
You are Eira, a highly disciplined and autonomous AI software developer. Your goal is to complete coding tasks by strictly following the provided plan. You must use the provided tools to interact with the file system. NEVER invent file contents. You must read a file before you can modify it. Execute the steps of the plan ONE AT A TIME. Do not attempt to call multiple tools in a single step. After each action, reflect on the result and proceed to the next logical step in the plan. Always summarize your final actions and confirm when the overall goal is complete.
`;
// This function encapsulates the creation of the agent and executor
function createAgentExecutor() {
    const prompt = prompts_1.ChatPromptTemplate.fromMessages([
        ["system", eiraSystemMessage],
        new prompts_1.MessagesPlaceholder("chat_history"),
        ["human", "{input}"],
        new prompts_1.MessagesPlaceholder("agent_scratchpad"),
    ]);
    const agent = (0, agents_1.createToolCallingAgent)({
        llm: llmWithTools,
        tools,
        prompt,
    });
    return new agents_1.AgentExecutor({
        agent,
        tools,
        verbose: true,
    });
}
// --- Main EiraAgent Class ---
class EiraAgent {
    agentExecutor;
    constructor(executor) {
        this.agentExecutor = executor;
    }
    // A static factory method for creating an instance of the agent
    static create() {
        const executor = createAgentExecutor();
        return new EiraAgent(executor);
    }
    // The run method now correctly accepts chat history
    async run(instruction, chatHistory) {
        if (!this.agentExecutor) {
            throw new Error("Agent executor not initialized.");
        }
        const response = await this.agentExecutor.invoke({
            input: instruction,
            chat_history: chatHistory,
        });
        return response.output;
    }
}
exports.EiraAgent = EiraAgent;

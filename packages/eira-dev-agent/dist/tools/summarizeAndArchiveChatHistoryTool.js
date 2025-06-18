"use strict";
// src/tools/summarizeAndArchiveChatHistoryTool.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeAndArchiveChatHistoryTool = void 0;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const promises_1 = require("fs/promises");
const google_genai_1 = require("@langchain/google-genai");
const messages_1 = require("@langchain/core/messages");
const midTermMemoryPath = 'eira_mid_term_memory.json';
const knowledgeBasePath = 'eira_knowledge_base.json';
const summarizationSchema = zod_1.z.object({
    taskToSummarize: zod_1.z.string().describe("The core task or topic of the conversation that was just completed."),
    keyLearnings: zod_1.z.array(zod_1.z.string()).describe("A list of the most important facts, decisions, or outcomes from the conversation."),
    outcome: zod_1.z.string().describe("The final result or conclusion of the task (e.g., 'Successfully refactored the component', 'Failed to find the bug')."),
});
// A simple, standalone LLM for the summarization task within the tool.
const summarizerLlm = new google_genai_1.ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash", // Use a fast model for this internal task
    temperature: 0.2,
});
const summarizer = summarizerLlm.withStructuredOutput(summarizationSchema);
async function generateSummary(chatHistory) {
    const historyText = chatHistory.map(msg => `${msg._getType()}: ${msg.content}`).join('\n');
    const prompt = `You are a summarization expert. Analyze the following conversation history and provide a concise summary in the required JSON format. Focus on the key technical achievements, decisions, and outcomes.

Conversation:
---
${historyText}
---`;
    const result = await summarizer.invoke(prompt);
    const summaryEntry = `
## Task: ${result.taskToSummarize}
- **Outcome:** ${result.outcome}
- **Key Learnnings:**
${result.keyLearnings.map(l => `  - ${l}`).join('\n')}
- **Summarized On:** ${new Date().toISOString()}
---`;
    return summaryEntry;
}
exports.summarizeAndArchiveChatHistoryTool = (0, tools_1.tool)(async () => {
    try {
        // 1. Read mid-term memory
        const memoryFileContent = await (0, promises_1.readFile)(midTermMemoryPath, 'utf-8');
        const chatHistory = JSON.parse(memoryFileContent);
        if (chatHistory.length < 10) {
            return "Conversation is too short to summarize. At least 10 turns are required.";
        }
        // 2. Generate a structured summary
        const newSummary = await generateSummary(chatHistory);
        // 3. Read and append to the knowledge base
        let knowledgeBaseContent = '';
        try {
            knowledgeBaseContent = await (0, promises_1.readFile)(knowledgeBasePath, 'utf-8');
        }
        catch (e) {
            // Knowledge base might not exist yet
            console.log("Knowledge base not found, creating a new one.");
        }
        await (0, promises_1.writeFile)(knowledgeBasePath, knowledgeBaseContent + newSummary);
        // 4. Truncate mid-term memory
        const truncatedHistory = chatHistory.slice(-4); // Keep the last 2 user/AI turns
        const archivalNotice = new messages_1.SystemMessage({
            content: `[Notice] The preceding conversation history has been summarized and archived to the long-term knowledge base on ${new Date().toISOString()}. The last few messages are kept for immediate context.`,
        });
        const newMemory = [archivalNotice, ...truncatedHistory];
        await (0, promises_1.writeFile)(midTermMemoryPath, JSON.stringify(newMemory, null, 2));
        return `Successfully summarized ${chatHistory.length} messages, appended to knowledge base, and truncated mid-term memory.`;
    }
    catch (error) {
        return `Error during summarization and archival: ${error.message}`;
    }
}, {
    name: "summarizeAndArchiveChatHistoryTool",
    description: "When the conversation history becomes long and context is getting lost, use this tool to summarize the key points of the current mid-term memory, save them to a permanent knowledge base, and truncate the mid-term memory to save tokens. Do not use this tool unless the conversation has become very long.",
    schema: zod_1.z.object({}), // This tool takes no input from the agent
});

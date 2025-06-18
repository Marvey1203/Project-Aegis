// src/tools/summarizeAndArchiveChatHistoryTool.ts

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { readFile, writeFile } from "fs/promises";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseMessage, SystemMessage } from "@langchain/core/messages";

const midTermMemoryPath = 'eira_mid_term_memory.json';
const knowledgeBasePath = 'eira_knowledge_base.json';

const summarizationSchema = z.object({
  taskToSummarize: z.string().describe("The core task or topic of the conversation that was just completed."),
  keyLearnings: z.array(z.string()).describe("A list of the most important facts, decisions, or outcomes from the conversation."),
  outcome: z.string().describe("The final result or conclusion of the task (e.g., 'Successfully refactored the component', 'Failed to find the bug')."),
});

// A simple, standalone LLM for the summarization task within the tool.
const summarizerLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash", // Use a fast model for this internal task
  temperature: 0.2,
});

const summarizer = summarizerLlm.withStructuredOutput(summarizationSchema);

async function generateSummary(chatHistory: BaseMessage[]): Promise<string> {
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


export const summarizeAndArchiveChatHistoryTool = tool(async () => {
  try {
    // 1. Read mid-term memory
    const memoryFileContent = await readFile(midTermMemoryPath, 'utf-8');
    const chatHistory: BaseMessage[] = JSON.parse(memoryFileContent);

    if (chatHistory.length < 10) {
      return "Conversation is too short to summarize. At least 10 turns are required.";
    }

    // 2. Generate a structured summary
    const newSummary = await generateSummary(chatHistory);

    // 3. Read and append to the knowledge base
    let knowledgeBaseContent = '';
    try {
      knowledgeBaseContent = await readFile(knowledgeBasePath, 'utf-8');
    } catch (e) {
      // Knowledge base might not exist yet
      console.log("Knowledge base not found, creating a new one.");
    }
    await writeFile(knowledgeBasePath, knowledgeBaseContent + newSummary);

    // 4. Truncate mid-term memory
    const truncatedHistory = chatHistory.slice(-4); // Keep the last 2 user/AI turns
    const archivalNotice = new SystemMessage({
      content: `[Notice] The preceding conversation history has been summarized and archived to the long-term knowledge base on ${new Date().toISOString()}. The last few messages are kept for immediate context.`,
    });
    const newMemory = [archivalNotice, ...truncatedHistory];
    await writeFile(midTermMemoryPath, JSON.stringify(newMemory, null, 2));

    return `Successfully summarized ${chatHistory.length} messages, appended to knowledge base, and truncated mid-term memory.`;
  } catch (error: any) {
    return `Error during summarization and archival: ${error.message}`;
  }
}, {
  name: "summarizeAndArchiveChatHistoryTool",
  description: "When the conversation history becomes long and context is getting lost, use this tool to summarize the key points of the current mid-term memory, save them to a permanent knowledge base, and truncate the mid-term memory to save tokens. Do not use this tool unless the conversation has become very long.",
  schema: z.object({}), // This tool takes no input from the agent
});
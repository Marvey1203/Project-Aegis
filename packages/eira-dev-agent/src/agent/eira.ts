// src/agent/eira.ts

import { BaseMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { Runnable } from '@langchain/core/runnables';
import { allTools as tools } from '../tools/index.js';
import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Annotation } from '@langchain/langgraph';

export const AgentStateSchema = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
});

export type AgentState = typeof AgentStateSchema.State;

const eiraSystemMessage = `You are Eira, a highly disciplined AI software developer. Your primary function is to execute tasks by calling tools.

Core Directives:
1.  **Tool-First Execution:** Always prefer calling tools over replying.
2.  **Focused Responses:** Respond only with tool calls or a final, direct answer to the user.
3.  **No Narration:** Do not narrate your actions or describe the tool calls you are about to make. Just execute them.
4.  **Efficient Execution:** Execute multiple tools in parallel whenever possible (e.g., reading multiple files at once). For dependent actions (like writing then verifying a file), you must perform them in separate sequential steps.
5.  **Reality-Driven:** Never assume. Always read files before modifying.
6.  **Verification Protocol:** After every file write operation, the system will verify your work. You must use this verification feedback to confirm success or correct errors.
7.  **Memory Management:** If the conversation becomes excessively long and you feel you are losing context, use the 'summarizeAndArchiveChatHistoryTool' to compress the history and free up working memory. This is a powerful tool to be used only when needed.`;

let agent: Runnable | null = null;

export function getAgent(): Runnable {
  if (!agent) {
    const llm = new ChatGoogleGenerativeAI({
      model: 'gemini-2.5-pro',
      maxOutputTokens: 8192,
      temperature: 0,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      verbose: false,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', eiraSystemMessage],
      new MessagesPlaceholder('messages'),
    ]);
    
    agent = prompt.pipe(llm.bindTools(tools));
  }
  return agent;
}
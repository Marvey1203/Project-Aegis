// packages/aegis-core/src/agents.ts

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// CORRECTED: Both AgentExecutor and createToolCallingAgent come from this high-level module.
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { DynamicTool } from "@langchain/core/tools";

// Import our tool creation function and our new generator function
import { createWebSearchTool } from "./tools.js";
import { generateAdCopy } from "./tools.js";

// CORRECT: Import the schema from its true source, 'schemas.ts'
import { GenerateAdCopyInputSchema } from "./schemas.js";

// ================================================================= //
// ==                       LYRA (MERCHANDISER)                     == //
// ================================================================= //

const lyraLlm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash-latest",
  temperature: 0,
});

const lyraTools = [createWebSearchTool()];

const lyraPrompt = ChatPromptTemplate.fromMessages([
  [ "system", `You are Lyra, the Head of Product...` ],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

const lyraAgent = createToolCallingAgent({
  llm: lyraLlm,
  tools: lyraTools,
  prompt: lyraPrompt,
});

export const lyraExecutor = new AgentExecutor({
  agent: lyraAgent,
  tools: lyraTools,
  verbose: true,
});

// ================================================================= //
// ==                        CAELUS (MARKETER)                      == //
// ================================================================= //

const caelusLlm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro-latest",
  temperature: 0.7,
});

// CORRECTED: We explicitly type the DynamicTool with our Zod schema.
// This resolves the type mismatch error for the 'func' property.
const adCopyTool = new DynamicTool({
  name: "generate_ad_copy",
  description: "Generates compelling marketing copy for a given product and platform.",
  func: async (input: string) => {
    // Parse the input string as JSON to match generateAdCopy's expected argument
    const parsed = JSON.parse(input);
    return generateAdCopy(parsed);
  },
});

const caelusTools = [adCopyTool];

const caelusPrompt = ChatPromptTemplate.fromMessages([
  [ "system", `You are Caelus, the Chief Marketing Officer...` ],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

const caelusAgent = createToolCallingAgent({
  llm: caelusLlm,
  tools: caelusTools,
  prompt: caelusPrompt,
});

export const caelusExecutor = new AgentExecutor({
  agent: caelusAgent,
  tools: caelusTools,
  verbose: true,
});
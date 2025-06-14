// packages/aegis-core/src/agents.ts (Corrected and Simplified)

import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

// --- STEP 1: Import the FINAL, PRE-BUILT tools from tools.ts ---
// We no longer need to import schemas or raw functions here.
import {
  webSearchTool,
  adCopyTool,
  createShopifyProductTool,
  sendEmailTool
} from './tools.js';

// --- CORE LLM ---
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro-latest",
  temperature: 0,
});

// --- STEP 2: ASSEMBLE THE IMPORTED TOOLS ---
// The tools are already created. We just need to put them in a list.
const tools = [
  webSearchTool,
  adCopyTool,
  createShopifyProductTool,
  sendEmailTool,
];

// --- AGENT CREATION LOGIC ---
// This function remains the same, as its logic is sound.
async function createAgentExecutor(agentName: string, persona: string) {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a helpful assistant. Your name is ${agentName}. Your persona is: ${persona}`],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const agent = await createToolCallingAgent({
    llm,
    tools, // Pass the assembled list of imported tools
    prompt,
  });

  return new AgentExecutor({
    agent,
    tools, // Pass the same list here
    verbose: true,
  });
}

// --- CREATE AND EXPORT AGENTS ---
// This section is also correct and remains unchanged.
export const lyraExecutor = await createAgentExecutor("Lyra", "You are Lyra, the Merchandiser. Your job is to research product viability.");
export const caelusExecutor = await createAgentExecutor("Caelus", "You are Caelus, the Marketer. Your job is to generate ad copy and marketing strategies.");
export const fornaxExecutor = await createAgentExecutor("Fornax", "You are Fornax, the Operator. Your job is to manage the e-commerce platform.");
export const corvusExecutor = await createAgentExecutor("Corvus", "You are Corvus, the Concierge. Your job is to handle customer communications.");
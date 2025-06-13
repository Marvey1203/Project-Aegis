// packages/aegis-core/src/agents.ts (Definitive, Self-Contained Prompt)

import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { DynamicStructuredTool } from "@langchain/core/tools";

// --- Import our tool functions and schemas ---
import {
  createWebSearchTool,
  generateAdCopy,
  createShopifyProduct,
  sendTransactionalEmail
} from './tools.js';
import {
  GenerateAdCopyInputSchema,
  productSchema,
  emailSchema
} from './schemas.js';

// --- CORE LLM ---
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro-latest",
  temperature: 0,
});

// --- ASSEMBLE TOOLS ---
const webSearchTool = createWebSearchTool();
const generateAdCopyTool = new DynamicStructuredTool({
  name: "generateAdCopy",
  description: "Generates compelling marketing ad copy for a product on a specific platform.",
  schema: GenerateAdCopyInputSchema,
  func: generateAdCopy,
});
const createShopifyProductTool = new DynamicStructuredTool({
  name: "createShopifyProduct",
  description: "Creates a new product in the Shopify store.",
  schema: productSchema,
  func: createShopifyProduct,
});
const sendTransactionalEmailTool = new DynamicStructuredTool({
  name: "sendTransactionalEmail",
  description: "Sends a transactional email to a user.",
  schema: emailSchema,
  func: sendTransactionalEmail,
});

const tools = [
  webSearchTool,
  generateAdCopyTool,
  createShopifyProductTool,
  sendTransactionalEmailTool,
];

// --- AGENT CREATION LOGIC ---
async function createAgentExecutor(agentName: string, persona: string) {
  // 1. Define the prompt directly in our code. No more external dependencies.
  // This is the standard, modern prompt for a tool-calling agent.
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a helpful assistant. Your name is ${agentName}. Your persona is: ${persona}`],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  // 2. This is the correct factory function for tool-calling models like Gemini.
  const agent = await createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  // 3. Create the final executor.
  return new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });
}

// --- CREATE AND EXPORT AGENTS ---
export const lyraExecutor = await createAgentExecutor("Lyra", "You are Lyra, the Merchandiser. Your job is to research product viability.");
export const caelusExecutor = await createAgentExecutor("Caelus", "You are Caelus, the Marketer. Your job is to generate ad copy and marketing strategies.");
export const fornaxExecutor = await createAgentExecutor("Fornax", "You are Fornax, the Operator. Your job is to manage the e-commerce platform.");
export const corvusExecutor = await createAgentExecutor("Corvus", "You are Corvus, the Concierge. Your job is to handle customer communications.");
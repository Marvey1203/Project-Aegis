// Fornax (The Merchandiser) - Manages product listings on the e-commerce platform.

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
// Corrected: Import both tools from the shopifyApiTool.ts file
import { shopifyCreateProductTool, shopifyGetOrdersTool } from '../tools/fornax/shopifyApiTool.js';

const fornaxSystemMessage = `You are Fornax, the Merchandiser agent for Project Aegis.
Your primary function is to manage product listings and orders on our e-commerce platforms, starting with Shopify.
You will be given product data and a command, such as 'list', 'update', or 'get orders'.
You must use your tools to interact with the Shopify API precisely and report the outcome.`;

const prompt = ChatPromptTemplate.fromMessages([
  ['system', fornaxSystemMessage],
  ['human', '{input}'],
  ['placeholder', '{agent_scratchpad}'],
]);

const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-pro',
  temperature: 0, // Merchandising should be precise, not creative.
});

// Add both tools to the agent's toolset
const tools = [shopifyCreateProductTool, shopifyGetOrdersTool];

const agent = await createToolCallingAgent({
  llm,
  tools,
  prompt,
});

export const fornaxExecutor = new AgentExecutor({
  agent,
  tools,
  verbose: true,
});

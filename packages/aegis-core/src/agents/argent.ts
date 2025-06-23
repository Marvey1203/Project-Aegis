// Argent (The Accountant) - Manages financial data and reporting.

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { shopifyGetOrdersTool } from '../tools/fornax/shopifyApiTool.js';
import { financialCircuitBreakerTool } from '../tools/argent/financialCircuitBreakerTool.js'; // Import the new tool

const argentSystemMessage = `You are Argent, the Accountant agent for Project Aegis.
Your purpose is to track all financial transactions and ensure financial safety.
You have two primary tools:
1. 'shopifyGetOrdersTool': Use this to fetch recent orders from our Shopify store when asked to 'get new orders' or 'fetch sales'.
2. 'financialCircuitBreakerTool': Use this to check if a proposed ad spend is within budget. When asked to 'approve spend', you must use this tool.

You must be precise, accurate, and adhere to all accounting principles.`;

const prompt = ChatPromptTemplate.fromMessages([
  ['system', argentSystemMessage],
  ['human', '{input}'],
  ['placeholder', '{agent_scratchpad}'],
]);

const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-pro',
  temperature: 0,
});

// Equip Argent with both its tools
const tools = [shopifyGetOrdersTool, financialCircuitBreakerTool];

const agent = await createToolCallingAgent({
  llm,
  tools,
  prompt,
});

export const argentExecutor = new AgentExecutor({
  agent,
  tools,
  verbose: true,
});

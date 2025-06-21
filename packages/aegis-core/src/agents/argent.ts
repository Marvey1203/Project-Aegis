// Argent (The Accountant) - Manages financial data and reporting.

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
// Import the order-fetching tool
import { shopifyGetOrdersTool } from '../tools/fornax/shopifyApiTool.js';

const argentSystemMessage = `You are Argent, the Accountant agent for Project Aegis.
Your purpose is to track all financial transactions, including revenue, costs, and profit.
You will be given financial data and will use your tools to record it, categorize it, and generate reports.
Your primary tool is the 'shopifyGetOrdersTool', which you can use to fetch recent orders from our Shopify store.
When asked to 'get new orders' or 'fetch sales', you should use this tool.
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

// Equip Argent with the tool to get Shopify orders.
const tools = [shopifyGetOrdersTool];

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

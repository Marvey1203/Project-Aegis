// Lyra (The Product Scout) - Identifies high-potential products and reliable suppliers.

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { cjDropshippingApiTool } from '../tools/lyra/cjDropshippingApiTool.js'; // Import the new tool

const lyraSystemMessage = `You are Lyra, the Product Scout agent for Project Aegis.
Your sole purpose is to identify high-potential products for our e-commerce brands.
You will be given criteria and a mission, and you must use your tools to find products that match.
You are analytical, thorough, and relentless in your search for profitable opportunities.`;

const prompt = ChatPromptTemplate.fromMessages([
  ['system', lyraSystemMessage],
  ['human', '{input}'],
  ['placeholder', '{agent_scratchpad}'],
]);

const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-pro',
  temperature: 0.2, // Slightly more creative for scouting
});

// Add the new tool to the agent's toolset
const tools = [cjDropshippingApiTool];

const agent = await createToolCallingAgent({
  llm,
  tools,
  prompt,
});

export const lyraExecutor = new AgentExecutor({
  agent,
  tools,
  verbose: true,
});

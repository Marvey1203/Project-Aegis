// Caelus (The Marketer) - Manages advertising and outreach to bring new customers.

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { facebookAdsTool } from '../tools/caelus/facebookAdsTool.js'; // Import the new tool

const caelusSystemMessage = `You are Caelus, the Marketer agent for Project Aegis.
Your primary function is to drive profitable growth by creating and managing advertising campaigns.
You will be given a product and a budget, and you must use your tools to create effective ads on platforms like Facebook and Google.
You are creative, data-driven, and focused on maximizing return on ad spend (ROAS).`;

const prompt = ChatPromptTemplate.fromMessages([
  ['system', caelusSystemMessage],
  ['human', '{input}'],
  ['placeholder', 'agent_scratchpad'],
]);

const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-pro',
  temperature: 0.5, // Marketing requires a bit more creativity.
});

// Add the new tool to the agent's toolset
const tools: any[] = [facebookAdsTool];

const agent = await createToolCallingAgent({
  llm,
  tools,
  prompt,
});

export const caelusExecutor = new AgentExecutor({
  agent,
  tools,
  verbose: true,
});

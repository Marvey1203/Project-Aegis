// Caelus (The Marketer) - Manages advertising and outreach to bring new customers.
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { facebookAdsTool } from '../tools/caelus/facebookAdsTool.js';
const caelusSystemMessage = `You are Caelus, the Marketer agent for Project Aegis.
Your primary function is to drive profitable growth by creating and managing advertising campaigns.
You will be given a product and a budget, and you must use your tools to create effective ads on platforms like Facebook and Google.
You are creative, data-driven, and focused on maximizing return on ad spend (ROAS).`;
// 2. USE the MessagesPlaceholder class for agent_scratchpad
const prompt = ChatPromptTemplate.fromMessages([
    ['system', caelusSystemMessage],
    ['human', '{input}'],
    new MessagesPlaceholder('agent_scratchpad'),
]);
const llm = new ChatGoogleGenerativeAI({
    // Let's keep your original for now, but be aware it might cause an error later.
    model: 'gemini-2.5-pro',
    temperature: 0.5,
});
// ... rest of the file is correct ...
const tools = [facebookAdsTool];
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
//# sourceMappingURL=caelus.js.map
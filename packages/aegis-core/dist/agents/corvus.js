// Corvus (The Concierge) - Processes customer orders and handles basic customer communication.
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { sendEmailTool } from '../tools/sendEmailTool.js';
const corvusSystemMessage = `You are Corvus, the Concierge agent for Project Aegis. 
Your primary function is to handle all customer-facing communication with professionalism and efficiency.
You are responsible for sending transactional emails, such as order confirmations and shipping notifications.
You must be polite, clear, and concise in all your communications.`;
const prompt = ChatPromptTemplate.fromMessages([
    ['system', corvusSystemMessage],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}'],
]);
const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-pro',
    temperature: 0,
});
const tools = [sendEmailTool];
const agent = await createToolCallingAgent({
    llm,
    tools,
    prompt,
});
export const corvusExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
});
//# sourceMappingURL=corvus.js.map
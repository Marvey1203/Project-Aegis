// Corvus (The Concierge) - Processes customer orders and handles basic customer communication.
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { communicationTool } from '../tools/corvus/communicationTool.js';
// --- UPDATED SYSTEM PROMPT ---
const corvusSystemMessage = `You are Corvus, the Concierge agent for Project Aegis.
Your primary function is to handle all customer-facing communication with professionalism and efficiency.
You are responsible for two main types of emails:
1.  **Transactional Emails:** Order confirmations and shipping notifications.
2.  **Post-Purchase Upsell Emails:** After a successful order, you may be asked to send a follow-up email offering a discount on a future purchase to increase customer lifetime value.

You must use your 'sendEmailTool' to send all communications.
When sending an upsell email, the subject should be "A Special Thank You From Our Store" and the body should offer a 10% discount code 'THANKYOU10' for their next purchase.
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
const tools = [communicationTool];
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
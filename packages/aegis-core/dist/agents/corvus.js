// Corvus (The Concierge) - Processes customer orders and handles basic customer communication.
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { communicationTool } from '../tools/corvus/communicationTool.js';
import { cjCreateOrderTool, cjGetOrderStatusTool } from '../tools/lyra/cjDropshippingApiTool.js'; // Import the new tool
// --- UPDATED SYSTEM PROMPT ---
const corvusSystemMessage = `You are Corvus, the Concierge agent for Project Aegis.
Your primary function is to handle all customer-facing communication and order fulfillment tasks with professionalism and efficiency.
You have several tools:
1.  'sendEmailTool': For sending transactional emails like order confirmations.
2.  'cjCreateOrderTool': For placing a fulfillment order with our supplier, CJ Dropshipping.
3.  'cjGetOrderStatusTool': For checking the status of an order you have placed with CJ Dropshipping.

Your workflow is as follows:
1.  When asked to fulfill an order, you will first use 'cjCreateOrderTool'.
2.  After placing the order, you must immediately use 'cjGetOrderStatusTool' with the new CJ order number to verify it was created successfully.
3.  You will then use 'sendEmailTool' to send a confirmation to the customer.`;
const prompt = ChatPromptTemplate.fromMessages([
    ['system', corvusSystemMessage],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}'],
]);
const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-pro',
    temperature: 0,
});
// Add all of Corvus's tools to its toolset
const tools = [communicationTool, cjCreateOrderTool, cjGetOrderStatusTool];
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
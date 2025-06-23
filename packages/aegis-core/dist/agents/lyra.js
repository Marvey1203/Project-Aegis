// packages/aegis-core/src/agents/lyra.ts
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { marketAnalysisTool } from '../tools/lyra/marketAnalysisTool.js';
import { cjDropshippingApiTool } from '../tools/lyra/cjDropshippingApiTool.js';
const lyraSystemMessage = `You are Lyra, the Product Scout agent for Project Aegis.
Your purpose is to identify high-potential products. You have a two-step process:

1.  **Demand Validation:** You MUST first use the 'comprehensiveMarketAnalysisTool'. This tool performs deep research and returns a JSON object with a "decision" and "summary".
    - If the tool's decision is "HALT", you must report that the market is not viable and stop.
    - If the decision is "PROCEED", you must use the summary to inform the next step.

2.  **Product Sourcing:** ONLY if demand is validated, you must then use the 'cjDropshippingApiTool' to find 3-5 specific products within the validated category. You must format the product data as a clean JSON object array for the next agent.`;
const tools = [marketAnalysisTool, cjDropshippingApiTool];
const prompt = ChatPromptTemplate.fromMessages([
    ['system', lyraSystemMessage],
    ['human', '{input}'],
    new MessagesPlaceholder('agent_scratchpad'),
]);
const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-pro',
    temperature: 0.1,
});
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
//# sourceMappingURL=lyra.js.map
"use strict";
// packages/eira-dev-agent/src/agent/lyraAgent.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLyraExecutor = getLyraExecutor;
const google_genai_1 = require("@langchain/google-genai");
const agents_1 = require("langchain/agents");
const prompts_1 = require("@langchain/core/prompts");
const tools_1 = require("../../../aegis-core/src/tools");
const proLlm = new google_genai_1.ChatGoogleGenerativeAI({
    model: 'gemini-2.5-pro-preview-06-05',
    temperature: 0,
});
const lyraTools = [
    tools_1.webSearchTool,
    tools_1.getSupplierDataTool,
    tools_1.scrapeWebsiteTool,
    tools_1.analyzeCompetitorsTool
];
const lyraSystemMessage = `You are Lyra, the lead Merchandising and Product Viability Analyst.
Your mission is to receive a product concept and produce a definitive "Product Sourcing & Viability Brief".
You must follow this Standard Operating Procedure (SOP) precisely:
1.  **Understand the Product:** Use 'webSearchTool' to understand the product.
2.  **Source Suppliers:** Use 'getSupplierDataTool' to find potential suppliers and select the best one.
3.  **Determine Retail Price:** Use 'analyzeCompetitorsAndSetPrice' to determine a competitive 'recommendedPrice'.
4.  **Formulate Final Brief:** Synthesize all information into a single, final JSON object with keys: 'product_title', 'product_description', 'supplierCost', 'recommendedPrice', 'supplierProductId', and 'imageUrl'.
Your final answer MUST be ONLY the raw JSON object.`;
async function getLyraExecutor() {
    const prompt = prompts_1.ChatPromptTemplate.fromMessages([
        ['system', lyraSystemMessage],
        new prompts_1.MessagesPlaceholder('chat_history'),
        ['human', '{input}'],
        new prompts_1.MessagesPlaceholder('agent_scratchpad')
    ]);
    const agent = await (0, agents_1.createToolCallingAgent)({
        llm: proLlm,
        tools: lyraTools,
        prompt
    });
    return new agents_1.AgentExecutor({
        agent,
        tools: lyraTools,
        verbose: true
    });
}

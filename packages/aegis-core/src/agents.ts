// packages/aegis-core/src/agents.ts
// Refactored by Eira to complete Project Aegis Phase I

import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
// --- CHANGE 1: Import all specialist tools for both Lyra and Fornax ---
import {
  webSearchTool,
  getSupplierDataTool,
  scrapeWebsiteTool,
  analyzeCompetitorsTool,
  createDraftProductTool,     // <-- Fornax's new tool
  attachProductImageTool,    // <-- Fornax's new tool
  updateVariantPriceTool,    // <-- Fornax's new tool
  updateProductStatusTool,   // <-- Fornax's new tool
  adCopyTool,
  sendEmailTool,
} from './tools.js';

// --- LLM Client Instantiation (Unchanged) ---
const proLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-pro-preview-06-05",
  temperature: 0,
});

const flashLlm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-preview-05-20",
  temperature: 0,
});

// --- Specialized Toolsets ---
const lyraTools = [
  webSearchTool,
  getSupplierDataTool,
  scrapeWebsiteTool,
  analyzeCompetitorsTool
];

// --- CHANGE 2: Grant Fornax his full suite of granular tools ---
const fornaxTools = [
  createDraftProductTool,
  attachProductImageTool,
  updateVariantPriceTool,
  updateProductStatusTool
];

const caelusTools = [adCopyTool];
const corvusTools = [sendEmailTool];

// --- Agent Factory (Unchanged) ---
async function createAgentExecutor(
  llm: ChatGoogleGenerativeAI,
  tools: any[],
  systemMessage: string
) {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemMessage],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);
  const agent = await createToolCallingAgent({ llm, tools, prompt });
  return new AgentExecutor({ agent, tools, verbose: true });
}

// --- Agent Personas (System Messages) ---

const lyraSystemMessage = `You are Lyra, the lead Merchandising and Product Viability Analyst.
Your mission is to receive a product concept and produce a definitive "Product Sourcing & Viability Brief".
You must follow this Standard Operating Procedure (SOP) precisely:
1.  **Understand the Product:** Use 'webSearchTool' to understand the product.
2.  **Source Suppliers:** Use 'getSupplierDataTool' to find potential suppliers and select the best one.
3.  **Determine Retail Price:** Use 'analyzeCompetitorsAndSetPrice' to determine a competitive 'recommendedPrice'.
4.  **Formulate Final Brief:** Synthesize all information into a single, final JSON object with keys: 'product_title', 'product_description', 'supplierCost', 'recommendedPrice', 'supplierProductId', and 'imageUrl'.
Your final answer MUST be ONLY the raw JSON object.`;

// --- CHANGE 3: Enhance Fornax's persona to a full multi-step SOP ---
const fornaxSystemMessage = `You are Fornax, the lead Shopify Store Operator.
Your mission is to receive a "Product Sourcing & Viability Brief" and publish the product to the store.
You must follow this Standard Operating Procedure (SOP) with precision:
1.  **Acknowledge Brief:** The user input will be a JSON object containing all necessary product data.
2.  **Create Draft:** Use the 'createDraftShopifyProduct' tool with the 'title' and 'description' from the brief. This will return a 'productId' and a 'variantId'.
3.  **Set the Price:** Use the 'updateProductVariantPrice' tool. You MUST use the 'variantId' from step 2 and the 'price' from the brief.
4.  **Attach the Image:** Use the 'attachProductImage' tool. You MUST use the 'productId' from step 2 and the 'imageUrl' from the brief.
5.  **Publish Product:** Use the 'updateProductStatus' tool. You MUST use the 'productId' from step 2 and set the status to 'ACTIVE'.
6.  **Confirm Completion:** Once all steps are complete, confirm to the user that the product has been successfully published with all details.`;

const caelusSystemMessage = `You are Caelus, the Marketer. Your role is to synthesize product information into creative, persuasive, and high-quality marketing copy.`;
const corvusSystemMessage = `You are Corvus, the Concierge. Your role is to handle communications reliably and efficiently.`;


// --- Agent Instantiation ---
export const lyraExecutor = await createAgentExecutor(proLlm, lyraTools, lyraSystemMessage);
export const caelusExecutor = await createAgentExecutor(proLlm, caelusTools, caelusSystemMessage);
export const fornaxExecutor = await createAgentExecutor(flashLlm, fornaxTools, fornaxSystemMessage);
export const corvusExecutor = await createAgentExecutor(flashLlm, corvusTools, corvusSystemMessage);
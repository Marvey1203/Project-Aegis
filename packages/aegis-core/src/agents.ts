// packages/aegis-core/src/agents.ts

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { createWebSearchTool } from "./tools.js";
import { generateAdCopy } from "./tools.js";
import { processOrder, sendShippingConfirmationEmail } from "./operational_tools.js";
import { 
  GenerateAdCopyInputSchema,
  ProcessOrderInputSchema,
  SendShippingConfirmationEmailInputSchema
} from "./schemas.js";

// ================================================================= //
// ==                       LYRA (MERCHANDISER)                     == //
// ================================================================= //

const lyraLlm = new ChatGoogleGenerativeAI({ model: "gemini-1.5-flash-latest", temperature: 0 });
const lyraTools = [createWebSearchTool()];
const lyraPrompt = ChatPromptTemplate.fromMessages([
  ["system", `You are Lyra, the Head of Product for Project Aegis. Your sole purpose is to identify and research potentially profitable products to sell. You are analytical, data-driven, and relentlessly focused on market trends. You must provide concise, actionable summaries based on your web research. Do not go off-topic.`],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);
const lyraAgent = createToolCallingAgent({ llm: lyraLlm, tools: lyraTools, prompt: lyraPrompt });
export const lyraExecutor = new AgentExecutor({ agent: lyraAgent, tools: lyraTools, verbose: true, returnIntermediateSteps: true });

// ================================================================= //
// ==                        CAELUS (MARKETER)                      == //
// ================================================================= //

const caelusLlm = new ChatGoogleGenerativeAI({ model: "gemini-1.5-pro-latest", temperature: 0.7 });
const adCopyTool = new DynamicStructuredTool({
  name: "generate_ad_copy",
  description: "Generates compelling marketing copy for a given product and platform.",
  schema: GenerateAdCopyInputSchema,
  func: generateAdCopy,
});
const caelusTools = [adCopyTool];
const caelusPrompt = ChatPromptTemplate.fromMessages([
  ["system", `You are Caelus, the Chief Marketing Officer for Project Aegis. Your sole purpose is to create persuasive, engaging, and effective marketing campaigns. You are creative, witty, and deeply understand customer psychology. When asked to generate copy, you must use the 'generate_ad_copy' tool. Do not go off-topic.`],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);
const caelusAgent = createToolCallingAgent({ llm: caelusLlm, tools: caelusTools, prompt: caelusPrompt });
export const caelusExecutor = new AgentExecutor({ agent: caelusAgent, tools: caelusTools, verbose: true, returnIntermediateSteps: true });

// ================================================================= //
// ==                        FORNAX (OPERATOR)                      == //
// ================================================================= //

const fornaxLlm = new ChatGoogleGenerativeAI({ model: "gemini-1.5-flash-latest", temperature: 0 });
const orderProcessingTool = new DynamicStructuredTool({
  name: "process_customer_order",
  description: "Processes a customer's e-commerce order by interfacing with Shopify and the supplier. Use this to fulfill an order.",
  schema: ProcessOrderInputSchema,
  func: async (input) => JSON.stringify(await processOrder(input)),
});
const fornaxTools = [orderProcessingTool];
const fornaxPrompt = ChatPromptTemplate.fromMessages([
  ["system", `You are Fornax, the Head of Operations for Project Aegis. Your sole purpose is to process customer orders accurately and efficiently. You are methodical, reliable, and deal only with concrete order details. When you receive an order to fulfill, you must use the 'process_customer_order' tool.`],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);
const fornaxAgent = createToolCallingAgent({ llm: fornaxLlm, tools: fornaxTools, prompt: fornaxPrompt });
export const fornaxExecutor = new AgentExecutor({ agent: fornaxAgent, tools: fornaxTools, verbose: true, returnIntermediateSteps: true });

// ================================================================= //
// ==                     CORVUS (THE CONCIERGE)                    == //
// ================================================================= //

const corvusLlm = new ChatGoogleGenerativeAI({ model: "gemini-1.5-flash-latest", temperature: 0.2 });
const emailTool = new DynamicStructuredTool({
  name: "send_shipping_confirmation_email",
  description: "Sends a shipping confirmation email to the customer with their order and tracking details. Use this after an order has been successfully processed.",
  schema: SendShippingConfirmationEmailInputSchema,
  func: sendShippingConfirmationEmail,
});
const corvusTools = [emailTool];
const corvusPrompt = ChatPromptTemplate.fromMessages([
  ["system", `You are Corvus, the Head of Customer Experience for Project Aegis. Your sole purpose is to provide clear, helpful, and reassuring communication to customers after they have placed an order. Your tone is always polite, professional, and friendly. When tasked with sending a shipping notification, you must use the 'send_shipping_confirmation_email' tool.`],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);
const corvusAgent = createToolCallingAgent({ llm: corvusLlm, tools: corvusTools, prompt: corvusPrompt });
export const corvusExecutor = new AgentExecutor({ agent: corvusAgent, tools: corvusTools, verbose: true, returnIntermediateSteps: true });
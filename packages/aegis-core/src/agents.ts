// packages/aegis-core/src/agents.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { createWebSearchTool } from "./tools.js";
import { generateAdCopy } from "./tools.js";
import { processOrder } from "./operational_tools.js";
import { SendShippingConfirmationEmailInputSchema, ProcessOrderInputSchema, GenerateAdCopyInputSchema } from "./schemas.js";
import { sendShippingConfirmationEmail } from "./operational_tools.js";

// --- LYRA ---
const lyraLlm = new ChatGoogleGenerativeAI({ model: "gemini-1.5-flash-latest", temperature: 0 });
const lyraTools = [createWebSearchTool()];
const lyraPrompt = ChatPromptTemplate.fromMessages([ ["system", `You are Lyra...`], new MessagesPlaceholder("chat_history"), ["human", "{input}"], new MessagesPlaceholder("agent_scratchpad"), ]);
const lyraAgent = createToolCallingAgent({ llm: lyraLlm, tools: lyraTools, prompt: lyraPrompt });
export const lyraExecutor = new AgentExecutor({ agent: lyraAgent, tools: lyraTools, verbose: true, returnIntermediateSteps: true });

// --- CAELUS ---
const caelusLlm = new ChatGoogleGenerativeAI({ model: "gemini-1.5-pro-latest", temperature: 0.7 });
const adCopyTool = new DynamicStructuredTool({ name: "generate_ad_copy", description: "Generates marketing copy.", schema: GenerateAdCopyInputSchema, func: generateAdCopy });
const caelusTools = [adCopyTool];
const caelusPrompt = ChatPromptTemplate.fromMessages([ ["system", `You are Caelus...`], new MessagesPlaceholder("chat_history"), ["human", "{input}"], new MessagesPlaceholder("agent_scratchpad"), ]);
const caelusAgent = createToolCallingAgent({ llm: caelusLlm, tools: caelusTools, prompt: caelusPrompt });
export const caelusExecutor = new AgentExecutor({ agent: caelusAgent, tools: caelusTools, verbose: true, returnIntermediateSteps: true });

// --- FORNAX ---
const fornaxLlm = new ChatGoogleGenerativeAI({ model: "gemini-1.5-flash-latest", temperature: 0 });
const orderProcessingTool = new DynamicStructuredTool({ name: "process_customer_order", description: "Processes a customer's order.", schema: ProcessOrderInputSchema, func: async (input) => JSON.stringify(await processOrder(input)) });
const fornaxTools = [orderProcessingTool];
const fornaxPrompt = ChatPromptTemplate.fromMessages([ ["system", `You are Fornax...`], new MessagesPlaceholder("chat_history"), ["human", "{input}"], new MessagesPlaceholder("agent_scratchpad"), ]);
const fornaxAgent = createToolCallingAgent({ llm: fornaxLlm, tools: fornaxTools, prompt: fornaxPrompt });
export const fornaxExecutor = new AgentExecutor({ agent: fornaxAgent, tools: fornaxTools, verbose: true, returnIntermediateSteps: true });

// --- CORVUS ---
const corvusLlm = new ChatGoogleGenerativeAI({ model: "gemini-1.5-flash-latest", temperature: 0.2 });
const emailTool = new DynamicStructuredTool({ name: "send_shipping_confirmation_email", description: "Sends a shipping confirmation email.", schema: SendShippingConfirmationEmailInputSchema, func: sendShippingConfirmationEmail });
const corvusTools = [emailTool];
const corvusPrompt = ChatPromptTemplate.fromMessages([ ["system", `You are Corvus...`], new MessagesPlaceholder("chat_history"), ["human", "{input}"], new MessagesPlaceholder("agent_scratchpad"), ]);
const corvusAgent = createToolCallingAgent({ llm: corvusLlm, tools: corvusTools, prompt: corvusPrompt });
export const corvusExecutor = new AgentExecutor({ agent: corvusAgent, tools: corvusTools, verbose: true, returnIntermediateSteps: true });
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { HumanMessage, AIMessage } from '@langchain/core/messages';

// Import all tools
import { listFilesTool } from '../tools/listFilesTool';
import { readFilesTool } from '../tools/readFilesTool';
import { writeFileTool } from '../tools/writeFileTool';
import { createFileTool } from '../tools/createFileTool';
import { runTestCommandTool } from '../tools/runTestCommandTool';
import { getCurrentDirectoryTool } from '../tools/getCurrentDirectoryTool';
import { findAndReplaceInFileTool } from '../tools/findAndReplaceInFileTool';
import { askHumanForHelpTool } from '../tools/askHumanForHelpTool';
import { createSprintTool, createTaskTool } from '../tools/projectManagementTools';
import { tavilySearchTool } from "../tools/searchTools";
import { basicPuppeteerScrapeTool, advancedScrapeTool } from "../tools/scrapingTools"; // Added advancedScrapeTool

// --- LLM and Tool Configuration ---
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-pro-preview-05-06",
  temperature: 0,
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
});

const tools = [
  listFilesTool,
  readFilesTool,
  writeFileTool,
  createFileTool,
  runTestCommandTool,
  getCurrentDirectoryTool,
  findAndReplaceInFileTool,
  askHumanForHelpTool,
  createSprintTool,
  createTaskTool,
  tavilySearchTool,
  basicPuppeteerScrapeTool,
  advancedScrapeTool, // Added advancedScrapeTool
];

const llmWithTools = llm.bindTools(tools);

// --- System Prompt Definition ---
const eiraSystemMessage = `
You are Eira, a highly disciplined and autonomous AI software developer. Your goal is to complete coding tasks by strictly following the provided plan. You must use the provided tools to interact with the file system. NEVER invent file contents. You must read a file before you can modify it. Execute the steps of the plan ONE AT A TIME. Do not attempt to call multiple tools in a single step. After each action, reflect on the result and proceed to the next logical step in the plan. Always summarize your final actions and confirm when the overall goal is complete.
Ensure to only output natural language responses in the cli to communcate with the user, and use the tools to perform actions. If you need to search for information, use the Tavily search tool or the Puppeteer scraping tool. If you encounter a situation where you cannot proceed, use the askHumanForHelp tool to get assistance.
`;

// This function encapsulates the creation of the agent and executor
function createAgentExecutor() {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", eiraSystemMessage],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const agent = createToolCallingAgent({
    llm: llmWithTools,
    tools,
    prompt,
  });

  return new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });
}

// --- Main EiraAgent Class ---
export class EiraAgent {
  public agentExecutor: AgentExecutor;

  private constructor(executor: AgentExecutor) {
    this.agentExecutor = executor;
  }

  // A static factory method for creating an instance of the agent
  static create() {
    const executor = createAgentExecutor();
    return new EiraAgent(executor);
  }

  // The run method now correctly accepts chat history
  async run(instruction: string, chatHistory: (HumanMessage | AIMessage)[]) {
    if (!this.agentExecutor) {
      throw new Error("Agent executor not initialized.");
    }
    
    // Ensure the input is not empty
    const processedInstruction = (instruction && instruction.trim() !== "") ? instruction : "(No specific instruction provided)";

    const response = await this.agentExecutor.invoke({
      input: processedInstruction,
      chat_history: chatHistory,
    });

    return response;
  }
}

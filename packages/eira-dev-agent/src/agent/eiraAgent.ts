// src/agent/eiraAgent.ts

import { AgentStateSchema, AgentState, getAgent } from "./eira.js";
import { StateGraph, START, END } from "@langchain/langgraph";
import { BaseMessage, AIMessage, ToolMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { allTools as tools } from "../tools/index.js";
import { readFilesTool } from "../tools/readFilesTool.js";
import pRetry from 'p-retry';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MEMORY_PATH = path.resolve(__dirname, "../../eira_mid_term_memory.json");

const fileSystemWriteTools = [
  "writeFileTool",
  "createFileTool",
  "findAndReplaceInFileTool",
];

// No changes needed for loadMidTermMemory, agentNode, customToolsNode, etc.
const loadMidTermMemory = () => {
  try {
    const raw = fs.readFileSync(MEMORY_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { status: 'empty', timestamp: new Date().toISOString() };
    }
    return parsed;
  } catch (e) {
    return { status: 'error', timestamp: new Date().toISOString() };
  }
};

const agentNode = async (state: AgentState) => {
  try {
    const midTermMemory = loadMidTermMemory();
    const agent = getAgent(JSON.stringify(midTermMemory).slice(0, 1000));

    const escapedMemory = JSON.stringify(midTermMemory).slice(0, 1000)
      .replace(/\{/g, '\\{').replace(/\}/g, '\\}');

    const memoryContent = escapedMemory && escapedMemory.trim().length > 0
      ? escapedMemory
      : 'No memory available';

    const memoryContext = new SystemMessage(
      `You are Eira, an AI software developer. Execute tasks by calling tools. Always explain your reasoning before taking action. Memory: ${memoryContent}`
    );

    const filtered = state.messages.filter(msg => !(msg instanceof SystemMessage));
    const validMessages = filtered.filter(msg => {
      const content = typeof msg.content === 'string' ? msg.content : '';
      return content.trim().length > 0;
    });

    const lastMessage = validMessages[validMessages.length - 1];
    let messages = [memoryContext, ...validMessages];

    if (!(lastMessage instanceof HumanMessage)) {
      messages.push(new HumanMessage("Could you please clarify your next steps or intentions?"));
    }

    const response = await agent.invoke({ messages });

    let normalizedContent = '';
    if (Array.isArray(response.content)) {
      normalizedContent = response.content.map((block: { text?: string }) => block.text || '').join('\n').trim();
    } else if (typeof response.content === 'string') {
      normalizedContent = response.content.trim();
    }
    response.content = normalizedContent;

    return { messages: [response] };
  } catch (error: any) {
    console.error('Error in agentNode:', error);
    const errorMessage = new AIMessage(`An error occurred during agent execution: ${error.message || 'Unknown error'}`);
    return { messages: [errorMessage] };
  }
};

const customToolsNode = async (state: AgentState): Promise<{ messages: ToolMessage[] }> => {
  const { messages } = state;
  const lastAiMessage = [...messages].reverse().find((m): m is AIMessage => m instanceof AIMessage);

  if (!lastAiMessage?.tool_calls) throw new Error("No tool calls found in the last AI message.");

  const toolsByName = Object.fromEntries(tools.map(tool => [tool.name, tool]));
  const toolExecutionResults: ToolMessage[] = [];

  for (const toolCall of lastAiMessage.tool_calls) {
    if (!toolCall.id) continue;

    const tool = toolsByName[toolCall.name];
    if (!tool) {
      toolExecutionResults.push(
        new ToolMessage({
          content: `Tool '${toolCall.name}' not found.`,
          tool_call_id: toolCall.id,
          name: toolCall.name,
        })
      );
      continue;
    }

    let toolOutput = '';
    try {
      const observation = await pRetry(() => (tool as any).invoke(toolCall.args), {
        retries: 3,
        onFailedAttempt: (error: any) => {
          console.warn(`Retry ${error.attemptNumber} failed: ${error.message}`);
        }
      });
      toolOutput = `Tool '${toolCall.name}' executed. Output: ${observation}`;
    } catch (e: any) {
      toolOutput = `Tool '${toolCall.name}' failed: ${e.message}`;
    }

    let verificationReport = '';
    if (fileSystemWriteTools.includes(toolCall.name)) {
      const filePath = (toolCall.args as any).filePath;
      const expectedContent = (toolCall.args as any).content || (toolCall.args as any).replace;

      try {
        const result = await readFilesTool.invoke({ filePaths: [filePath] });
        verificationReport = result.includes(expectedContent)
          ? `Verified: expected content found in '${filePath}'.`
          : `Verification failed: expected content missing in '${filePath}'. Content:\n${result}`;
      } catch {
        verificationReport = `Could not read file '${filePath}' for verification.`;
      }
    }

    const finalContent = verificationReport ? `${toolOutput}\n--- Verification ---\n${verificationReport}` : toolOutput;

    toolExecutionResults.push(new ToolMessage({ content: finalContent, tool_call_id: toolCall.id, name: toolCall.name }));
  }

  return { messages: toolExecutionResults };
};

const validatePlanNode = async (state: AgentState) => {
  try {
    const plan = state.messages[state.messages.length - 1]?.content ?? "";
    const memory = loadMidTermMemory();
    const escapedMemory = JSON.stringify(memory).slice(0, 1000).replace(/\{/g, '\\{').replace(/\}/g, '\\}');
    const systemMessage = new SystemMessage(`You are Eira's internal critic. Analyze this plan for logic, feasibility, and consistency with memory. Memory Context: ${escapedMemory}`);
    const agent = getAgent(JSON.stringify(memory).slice(0, 1000));

    const response = await agent.invoke({
      messages: [systemMessage, new HumanMessage(`Plan: ${plan}`)],
    });

    if (
      response instanceof AIMessage &&
      typeof response.content === 'string' &&
      response.content.toLowerCase().includes("should be rejected")
    ) {
      return { messages: [new SystemMessage(`Plan rejected. Critique: ${response.content}`)] };
    }
    
    return { messages: [response] };
  } catch (error: any) {
    console.error('Error in validatePlanNode:', error);
    const errorMessage = new AIMessage(`Error validating plan: ${error.message || 'Unknown error'}`);
    return { messages: [errorMessage] };
  }
};

const handleErrorNode = async (state: AgentState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  return {
    messages: [new AIMessage(`An error occurred: ${lastMessage.content || "Unknown error"}. Attempting recovery.`)],
  };
};

const postExecutionReflectionNode = async (state: AgentState) => {
  try {
    const toolMessages = state.messages.filter((m) => m instanceof ToolMessage);
    if (toolMessages.length === 0) {
      return {};
    }

    const usedTools = toolMessages.map((m) => m.content).join("\n");
    const memory = loadMidTermMemory();
    const escapedMemory = JSON.stringify(memory).slice(0, 1000).replace(/\{/g, '\\{').replace(/\}/g, '\\}');
    const systemMessage = new SystemMessage(`You are Eira's reflection module. Reflect on recent execution and what to remember. Memory Context: ${escapedMemory}`);
    const agent = getAgent(JSON.stringify(memory).slice(0, 1000));

    const promptContent = `Tool outcomes:\n\n${usedTools}`;
    const reflection = await agent.invoke({ messages: [systemMessage, new HumanMessage(promptContent)] });

    return { messages: [reflection] };
  } catch (error: any) {
    console.error('Error in postExecutionReflectionNode:', error);
    const errorMessage = new AIMessage(`Error during reflection: ${error.message || 'Unknown error'}`);
    return { messages: [errorMessage] };
  }
};

// *** CRITICAL CHANGE: Updated router to handle the "human-in-the-loop" signal. ***
const shouldCallTools = (state: AgentState) => {
  const lastMessage = state.messages[state.messages.length - 1];

  if (lastMessage.content && typeof lastMessage.content === 'string' && lastMessage.content.startsWith("An error occurred")) {
    return "error";
  }

  if (lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    // Check if the agent is calling the special tool to ask for help.
    const isAskingForHelp = lastMessage.tool_calls.some(
      (call) => call.name === "askHumanForHelpTool"
    );

    // If it's asking for help, we END this execution run. The CLI will then take over.
    if (isAskingForHelp) {
      return END;
    }
    
    // Otherwise, these are normal tools to be executed.
    return "tools";
  }

  // If the message is a text-only plan, it needs validation.
  if (lastMessage instanceof AIMessage) {
    return "validate_plan";
  }

  return END;
};

// --- GRAPH DEFINITION ---
const workflow = new StateGraph(AgentStateSchema)
  .addNode("agent", agentNode)
  .addNode("tools", customToolsNode)
  .addNode("error", handleErrorNode)
  .addNode("validate_plan", validatePlanNode)
  .addNode("reflect", postExecutionReflectionNode);

workflow.addEdge(START, "agent");

workflow.addConditionalEdges("agent", shouldCallTools, {
  tools: "tools",
  validate_plan: "validate_plan",
  error: "error",
  [END]: END,
});

// This edge is correct: after validation, always loop back to the agent
// with the critic's feedback.
workflow.addEdge("validate_plan", "agent");

// The rest of the graph logic is correct.
workflow.addEdge("tools", "reflect");
workflow.addEdge("reflect", "agent");
workflow.addEdge("error", "agent");

export const graph = workflow.compile();


export class EiraAgent {
  private graph = graph;

  static create() {
    return new EiraAgent();
  }

  async run(userInput: string, chatHistory: BaseMessage[]): Promise<BaseMessage[]> {
    if (!userInput || userInput.trim() === '') {
      throw new Error("Empty user input");
    }

    const initialMessages = [...chatHistory, new HumanMessage(userInput)];
    const result = await this.invoke({ messages: initialMessages });

    return result.messages;
  }

  private async invoke(input: { messages: BaseMessage[] }) {
    if (!input.messages || input.messages.length === 0) {
      throw new Error("No messages provided to agent");
    }

    const cleanedMessages = input.messages.filter(msg => !(msg instanceof SystemMessage));

    const lastHumanIndex = [...cleanedMessages].reverse().findIndex(msg => msg instanceof HumanMessage);
    if (lastHumanIndex === -1) {
      cleanedMessages.push(new HumanMessage("What would you like to do next?"));
    }
    
    const midTermMemory = loadMidTermMemory();
    const escapedMemory = JSON.stringify(midTermMemory).slice(0, 500).replace(/\{/g, '\\{').replace(/\}/g, '\\}');
    const memoryContent = escapedMemory && escapedMemory.trim().length > 0 ? escapedMemory : 'No memory available';
    const systemMessageWithMemory = `You are Eira, an AI software developer. Execute tasks by calling tools. Always explain your reasoning before taking action. Memory: ${memoryContent}`;
    const memoryContext = new SystemMessage(systemMessageWithMemory);
    const finalMessages = [memoryContext, ...cleanedMessages];

    return this.graph.invoke({ messages: finalMessages }, { recursionLimit: 100 });
  }
}
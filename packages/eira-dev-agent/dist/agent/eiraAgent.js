import { AgentStateSchema, getAgent } from "./eira.js";
import { StateGraph, START, END } from "@langchain/langgraph";
import { AIMessage, ToolMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
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
const loadMidTermMemory = () => {
    try {
        const raw = fs.readFileSync(MEMORY_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') {
            return { status: 'empty', timestamp: new Date().toISOString() };
        }
        return parsed;
    }
    catch (e) {
        return { status: 'error', timestamp: new Date().toISOString() };
    }
};
const agentNode = async (state) => {
    try {
        const midTermMemory = loadMidTermMemory();
        const agent = getAgent(JSON.stringify(midTermMemory).slice(0, 1000));
        const escapedMemory = JSON.stringify(midTermMemory).slice(0, 1000)
            .replace(/\{/g, '\\{').replace(/\}/g, '\\}');
        const memoryContent = escapedMemory && escapedMemory.trim().length > 0
            ? escapedMemory
            : 'No memory available';
        const memoryContext = new SystemMessage(`You are Eira, an AI software developer. Execute tasks by calling tools. Always explain your reasoning before taking action. Memory: ${memoryContent}`);
        const filtered = state.messages.filter(msg => !(msg instanceof SystemMessage));
        const validMessages = filtered.filter(msg => {
            const content = typeof msg.content === 'string' ? msg.content : '';
            return content.trim().length > 0;
        });
        // Automatic fallback user prompt injection if last message is not from human
        const lastMessage = validMessages[validMessages.length - 1];
        let messages = [memoryContext, ...validMessages];
        if (!(lastMessage instanceof HumanMessage)) {
            messages.push(new HumanMessage("Could you please clarify your next steps or intentions?"));
        }
        // Invoke agent
        const response = await agent.invoke({ messages });
        // Normalize response content
        let normalizedContent = '';
        if (Array.isArray(response.content)) {
            normalizedContent = response.content.map((block) => block.text || '').join('\n').trim();
        }
        else if (typeof response.content === 'string') {
            normalizedContent = response.content.trim();
        }
        response.content = normalizedContent;
        return { messages: [response] };
    }
    catch (error) {
        console.error('Error in agentNode:', error);
        const errorMessage = new AIMessage(`An error occurred during agent execution: ${error.message || 'Unknown error'}`);
        return { messages: [errorMessage] };
    }
};
const customToolsNode = async (state) => {
    const { messages } = state;
    const lastAiMessage = [...messages].reverse().find((m) => m instanceof AIMessage);
    if (!lastAiMessage?.tool_calls)
        throw new Error("No tool calls found in the last AI message.");
    const toolsByName = Object.fromEntries(tools.map(tool => [tool.name, tool]));
    const toolExecutionResults = [];
    for (const toolCall of lastAiMessage.tool_calls) {
        if (!toolCall.id)
            continue;
        const tool = toolsByName[toolCall.name];
        if (!tool) {
            toolExecutionResults.push(new ToolMessage({
                content: `Tool '${toolCall.name}' not found.`,
                tool_call_id: toolCall.id,
                name: toolCall.name,
            }));
            continue;
        }
        let toolOutput = '';
        try {
            const observation = await pRetry(() => tool.invoke(toolCall.args), {
                retries: 3,
                onFailedAttempt: (error) => {
                    console.warn(`Retry ${error.attemptNumber} failed: ${error.message}`);
                }
            });
            toolOutput = `Tool '${toolCall.name}' executed. Output: ${observation}`;
        }
        catch (e) {
            toolOutput = `Tool '${toolCall.name}' failed: ${e.message}`;
        }
        // Verification Layer for file system write tools
        let verificationReport = '';
        if (fileSystemWriteTools.includes(toolCall.name)) {
            const filePath = toolCall.args.filePath;
            const expectedContent = toolCall.args.content || toolCall.args.replace;
            try {
                const result = await readFilesTool.invoke({ filePaths: [filePath] });
                verificationReport = result.includes(expectedContent)
                    ? `Verified: expected content found in '${filePath}'.`
                    : `Verification failed: expected content missing in '${filePath}'. Content:\n${result}`;
            }
            catch {
                verificationReport = `Could not read file '${filePath}' for verification.`;
            }
        }
        const finalContent = verificationReport ? `${toolOutput}\n--- Verification ---\n${verificationReport}` : toolOutput;
        toolExecutionResults.push(new ToolMessage({ content: finalContent, tool_call_id: toolCall.id, name: toolCall.name }));
    }
    return { messages: toolExecutionResults };
};
const validatePlanNode = async (state) => {
    try {
        const plan = state.messages[state.messages.length - 1]?.content ?? "";
        const memory = loadMidTermMemory();
        const escapedMemory = JSON.stringify(memory).slice(0, 1000).replace(/\{/g, '\\{').replace(/\}/g, '\\}');
        const systemMessage = new SystemMessage(`You are Eira's internal critic. Analyze this plan for logic, feasibility, and consistency with memory. Memory Context: ${escapedMemory}`);
        const agent = getAgent(JSON.stringify(memory).slice(0, 1000));
        const response = await agent.invoke({
            messages: [systemMessage, new HumanMessage(`Plan: ${plan}`)],
        });
        if (response instanceof AIMessage &&
            typeof response.content === 'string' &&
            response.content.toLowerCase().includes("should be rejected")) {
            // The critic rejected the plan. Return a clear system message with the critique.
            return { messages: [new SystemMessage(`Plan rejected. Critique: ${response.content}`)] };
        }
        // The critic approved the plan. Return its approval message.
        return { messages: [response] };
    }
    catch (error) {
        console.error('Error in validatePlanNode:', error);
        const errorMessage = new AIMessage(`Error validating plan: ${error.message || 'Unknown error'}`);
        return { messages: [errorMessage] };
    }
};
const handleErrorNode = async (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    return {
        messages: [new AIMessage(`An error occurred: ${lastMessage.content || "Unknown error"}. Attempting recovery.`)],
    };
};
const postExecutionReflectionNode = async (state) => {
    try {
        const toolMessages = state.messages.filter((m) => m instanceof ToolMessage);
        // *** FIX 1: If no tools were run, there's nothing to reflect on.
        // Return an empty object to make this a "pass-through" node.
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
    }
    catch (error) {
        console.error('Error in postExecutionReflectionNode:', error);
        const errorMessage = new AIMessage(`Error during reflection: ${error.message || 'Unknown error'}`);
        return { messages: [errorMessage] };
    }
};
const shouldCallTools = (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    // If the agent has produced an error, go to the error handling node.
    if (lastMessage.content && typeof lastMessage.content === 'string' && lastMessage.content.startsWith("An error occurred")) {
        return "error";
    }
    // If the agent's last message contains tool calls, execute them.
    if (lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return "tools";
    }
    // If the agent's last message is text (a plan or a final answer without tools),
    // let's send it to the critic for validation.
    if (lastMessage instanceof AIMessage) {
        // This catches text-only plans that need validation.
        return "validate_plan";
    }
    // Otherwise, the turn is over.
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
// *** FIX 2: Correct the logic for the validation node.
// After the critic has run, we ALWAYS go back to the agent.
// The agent will then see the critic's feedback (either "approved" or "rejected")
// and decide what to do next: either generate the tool call for the approved plan
// or generate a new, corrected plan.
workflow.addEdge("validate_plan", "agent");
// *** FIX 3: DELETE THE BUGGY UNCONDITIONAL EDGE
// This was the primary cause of the loop.
// workflow.addEdge("validate_plan", "tools"); // <-- DELETED
workflow.addEdge("tools", "reflect");
workflow.addEdge("reflect", "agent");
workflow.addEdge("error", "agent");
export const graph = workflow.compile();
export class EiraAgent {
    graph = graph;
    static create() {
        return new EiraAgent();
    }
    async run(userInput, chatHistory) {
        if (!userInput || userInput.trim() === '') {
            throw new Error("Empty user input");
        }
        const initialMessages = [...chatHistory, new HumanMessage(userInput)];
        const result = await this.invoke({ messages: initialMessages });
        return result.messages;
    }
    async invoke(input) {
        if (!input.messages || input.messages.length === 0) {
            throw new Error("No messages provided to agent");
        }
        // Filter out ALL SystemMessages to ensure only one system message exists
        const cleanedMessages = input.messages.filter(msg => !(msg instanceof SystemMessage));
        // Check for recent human input, inject fallback if missing
        // This safety net is still useful.
        const lastHumanIndex = [...cleanedMessages].reverse().findIndex(msg => msg instanceof HumanMessage);
        if (lastHumanIndex === -1) {
            cleanedMessages.push(new HumanMessage("What would you like to do next?"));
        }
        // Load memory and inject system message
        const midTermMemory = loadMidTermMemory();
        const escapedMemory = JSON.stringify(midTermMemory).slice(0, 500).replace(/\{/g, '\\{').replace(/\}/g, '\\}');
        const memoryContent = escapedMemory && escapedMemory.trim().length > 0 ? escapedMemory : 'No memory available';
        const systemMessageWithMemory = `You are Eira, an AI software developer. Execute tasks by calling tools. Always explain your reasoning before taking action. Memory: ${memoryContent}`;
        const memoryContext = new SystemMessage(systemMessageWithMemory);
        const finalMessages = [memoryContext, ...cleanedMessages];
        return this.graph.invoke({ messages: finalMessages }, { recursionLimit: 100 });
    }
}

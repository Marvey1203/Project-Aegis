// src/agent/eiraAgent.ts
import { AgentStateSchema, getAgent } from "./eira.js";
import { StateGraph, START, END } from "@langchain/langgraph";
import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { allTools as tools } from "../tools/index.js";
import { HumanMessage } from "@langchain/core/messages";
import { readFilesTool } from "../tools/readFilesTool.js";
// FIX: This list now ONLY contains tools that perform direct, verifiable file I/O.
const fileSystemWriteTools = [
    "writeFileTool",
    "createFileTool",
    "findAndReplaceInFileTool",
];
const agentNode = async (state) => {
    const agent = getAgent();
    const response = await agent.invoke({ messages: state.messages });
    return { messages: [response] };
};
const customToolsNode = async (state) => {
    const { messages } = state;
    const lastAiMessage = [...messages]
        .reverse()
        .find((m) => m instanceof AIMessage);
    if (!lastAiMessage || !lastAiMessage.tool_calls) {
        throw new Error("No tool calls found in the last AI message.");
    }
    const toolExecutionResults = [];
    const toolsByName = Object.fromEntries(tools.map(tool => [tool.name, tool]));
    for (const toolCall of lastAiMessage.tool_calls) {
        if (!toolCall.id) {
            console.error(`Tool call '${toolCall.name}' is missing an ID. Skipping.`);
            continue;
        }
        const tool = toolsByName[toolCall.name];
        if (!tool) {
            toolExecutionResults.push(new ToolMessage({
                content: `Error: Tool '${toolCall.name}' not found.`,
                tool_call_id: toolCall.id,
            }));
            continue;
        }
        let toolOutput;
        try {
            const observation = await tool.invoke(toolCall.args);
            toolOutput = `Tool '${toolCall.name}' executed successfully. Direct output: ${observation}`;
        }
        catch (e) {
            toolOutput = `Error executing tool '${toolCall.name}': ${e.message}`;
        }
        // --- Start of Integrated Verification Logic ---
        let verificationReport = '';
        // FIX: The verification logic now only triggers for the tools in our specific list.
        if (fileSystemWriteTools.includes(toolCall.name)) {
            const filePath = toolCall.args.filePath;
            if (typeof filePath !== 'string') {
                verificationReport = 'Verification skipped: No filePath provided.';
            }
            else {
                let expectedContent;
                if (toolCall.name === 'writeFileTool' || toolCall.name === 'createFileTool') {
                    expectedContent = toolCall.args.content;
                }
                else if (toolCall.name === 'findAndReplaceInFileTool') {
                    expectedContent = toolCall.args.replace;
                }
                try {
                    const readResult = await readFilesTool.invoke({ filePaths: [filePath] });
                    if (typeof expectedContent === 'string' && expectedContent.trim() !== '') {
                        if (readResult.includes(expectedContent)) {
                            verificationReport = `DEEP_VERIFICATION_SUCCESS: Verified that the expected content is present in '${filePath}'.`;
                        }
                        else {
                            verificationReport = `DEEP_VERIFICATION_FAILURE: The expected content was NOT found in '${filePath}'. The file content is:\n${readResult}`;
                        }
                    }
                    else {
                        verificationReport = `SHALLOW_VERIFICATION_SUCCESS: Verified that '${filePath}' is readable.`;
                    }
                }
                catch (e) {
                    verificationReport = `VERIFICATION_ERROR: An unexpected error occurred while trying to read '${filePath}' for verification.`;
                }
            }
        }
        // --- End of Integrated Verification Logic ---
        const finalContent = verificationReport
            ? `${toolOutput}\n---Verification Result---\n${verificationReport}`
            : toolOutput;
        toolExecutionResults.push(new ToolMessage({
            content: finalContent,
            tool_call_id: toolCall.id,
        }));
    }
    return { messages: toolExecutionResults };
};
const shouldCallTools = (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (!(lastMessage instanceof AIMessage) || !lastMessage.tool_calls?.length) {
        return END;
    }
    return "tools";
};
const workflow = new StateGraph(AgentStateSchema)
    .addNode("agent", agentNode)
    .addNode("tools", customToolsNode);
workflow.addEdge(START, "agent");
workflow.addConditionalEdges("agent", shouldCallTools, {
    tools: "tools",
    [END]: END,
});
workflow.addEdge("tools", "agent");
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
        return this.graph.invoke(input);
    }
}

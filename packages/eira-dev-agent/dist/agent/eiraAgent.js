// packages/eira-dev-agent/src/agent/eiraAgent.ts
import { AgentStateSchema, getArchitectAgent } from './eira.js';
import { StateGraph, START, END } from '@langchain/langgraph';
import { AIMessage, ToolMessage } from '@langchain/core/messages';
import { getTools } from '../tools/index.js';
// --- Universal Message Sanitization Helper ---
function sanitizeMessages(messages) {
    return messages.filter(msg => {
        if (!msg)
            return false;
        if (msg._getType() === 'human' || msg._getType() === 'tool') {
            return typeof msg.content === 'string' && msg.content.trim().length > 0;
        }
        if (msg._getType() === 'ai') {
            const aiMsg = msg;
            const hasTextContent = typeof aiMsg.content === 'string' && aiMsg.content.trim().length > 0;
            const hasToolCalls = Array.isArray(aiMsg.tool_calls) && aiMsg.tool_calls.length > 0;
            return hasTextContent || hasToolCalls;
        }
        return false;
    });
}
// --- The core nodes of our new agent graph ---
async function architectNode(state) {
    const architect = getArchitectAgent();
    const sanitizedMessages = sanitizeMessages(state.messages);
    const response = await architect.invoke({ messages: sanitizedMessages });
    return { messages: [response] };
}
async function customToolsNode(state) {
    const lastAiMessage = state.messages[state.messages.length - 1];
    if (!lastAiMessage?.tool_calls) {
        throw new Error('Logic error: customToolsNode was called but the preceding AI message had no tool_calls.');
    }
    const tools = getTools();
    const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));
    const toolExecutionResults = [];
    for (const toolCall of lastAiMessage.tool_calls) {
        if (!toolCall.id)
            continue;
        const tool = toolsByName[toolCall.name];
        if (!tool) {
            toolExecutionResults.push(new ToolMessage({ content: `Error: Tool '${toolCall.name}' not found.`, tool_call_id: toolCall.id, name: toolCall.name }));
            continue;
        }
        try {
            const observation = await tool.invoke(toolCall.args);
            toolExecutionResults.push(new ToolMessage({ content: String(observation), tool_call_id: toolCall.id, name: toolCall.name, }));
        }
        catch (e) {
            toolExecutionResults.push(new ToolMessage({ content: `Tool '${toolCall.name}' failed with error: ${e.message}`, tool_call_id: toolCall.id, name: toolCall.name, }));
        }
    }
    return { messages: toolExecutionResults };
}
// --- The Router Logic ---
function routeFromArchitect(state) {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        return 'tools';
    }
    return END;
}
// --- The Graph Definition ---
const workflow = new StateGraph(AgentStateSchema)
    .addNode('architect', architectNode)
    .addNode('tools', customToolsNode);
workflow.addEdge(START, 'architect');
workflow.addConditionalEdges('architect', routeFromArchitect, {
    tools: 'tools',
    [END]: END,
});
workflow.addEdge('tools', 'architect');
// --- THE CRITICAL CHANGE IS HERE ---
export const graph = workflow.compile({
    // Tell the graph to pause before executing the 'tools' node.
    interruptBefore: ['tools'],
});
// --- The EiraAgent Class ---
export class EiraAgent {
    graph = graph;
    static create() {
        return new EiraAgent();
    }
    // We no longer need the stream method as the CLI will manage the loop.
    async invoke(state) {
        return this.graph.invoke(state);
    }
}

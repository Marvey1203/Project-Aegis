// src/cli.ts
import 'dotenv/config';
import { EiraAgent } from './agent/eiraAgent.js';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { HumanMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
import { loadMemory, saveMemory } from './memoryUtils.js';
import { getTools } from './tools/index.js';
// This function executes non-human tools. It's adapted from the agent's internal node.
async function toolExecutorNode(state) {
    const lastAiMessage = state.messages[state.messages.length - 1];
    if (!lastAiMessage?.tool_calls) {
        throw new Error('toolExecutorNode was called but the preceding AI message had no tool_calls.');
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
const memoryFilePath = 'eira_mid_term_memory.json';
async function main() {
    console.log('--- Eira Interactive CLI v1.5 (Human-in-the-Loop) ---');
    console.log('Initializing agent and loading memory...');
    const eira = EiraAgent.create();
    const rl = readline.createInterface({ input, output });
    let chatHistory = await loadMemory(memoryFilePath);
    if (chatHistory.length > 0) {
        const interactionCount = chatHistory.filter(m => m instanceof HumanMessage).length;
        console.log(`Loaded ${interactionCount} previous interactions from memory.`);
    }
    console.log('\nEira is ready. You can start the conversation. Type \'exit\' to end.\n');
    while (true) { // Main loop now runs indefinitely until explicitly exited
        let nextUserInput = await rl.question('Marius: ');
        if (nextUserInput.toLowerCase() === 'exit') {
            break; // Exit the loop if user types 'exit'
        }
        console.log('Eira is thinking...');
        try {
            let currentState = {
                messages: [...chatHistory, new HumanMessage(nextUserInput)],
                retries: 0,
            };
            let finalTurnState = null;
            while (true) {
                const result = await eira.invoke(currentState);
                finalTurnState = result;
                const lastMessage = result.messages[result.messages.length - 1];
                if (lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
                    const humanToolCall = lastMessage.tool_calls.find((tc) => tc.name === 'askHumanForHelpTool' || tc.name === 'humanConfirmationTool');
                    if (humanToolCall) {
                        const question = humanToolCall.args.question || humanToolCall.args.planSummary || 'Awaiting your input...';
                        console.log(`\nEira: ${question}`);
                        const humanResponse = await rl.question('Marius: ');
                        if (humanResponse.toLowerCase() === 'exit') {
                            // Allow exiting even when responding to a tool call
                            finalTurnState = null; // Prevent saving this partial state
                            break;
                        }
                        currentState = {
                            messages: [
                                ...result.messages,
                                new ToolMessage({
                                    tool_call_id: humanToolCall.id,
                                    content: humanResponse,
                                })
                            ],
                            retries: result.retries || 0,
                        };
                        continue;
                    }
                    else {
                        console.log(`\nEira is using a tool: ${lastMessage.tool_calls.map(tc => tc.name).join(', ')}`);
                        const toolResults = await toolExecutorNode(result);
                        currentState = {
                            messages: [...result.messages, ...toolResults.messages],
                            retries: result.retries || 0,
                        };
                        continue;
                    }
                }
                if (lastMessage instanceof AIMessage && lastMessage.content) {
                    let textToPrint = '';
                    if (Array.isArray(lastMessage.content)) {
                        textToPrint = lastMessage.content
                            .filter(part => part.type === 'text' && typeof part.text === 'string')
                            .map(part => part.text)
                            .join('');
                    }
                    else {
                        textToPrint = lastMessage.content;
                    }
                    if (textToPrint.trim()) {
                        console.log(`\nEira: ${textToPrint}`);
                    }
                }
                break;
            }
            if (finalTurnState) {
                chatHistory = finalTurnState.messages;
                await saveMemory(memoryFilePath, chatHistory);
            }
            else {
                // This handles the case where we broke out of the inner loop due to 'exit'
                break;
            }
        }
        catch (error) {
            console.error('\nAn error occurred in the agent execution loop:', error);
            const recoveryInput = await rl.question('Please try again or type \'exit\'.\nMarius: ');
            if (recoveryInput.toLowerCase() === 'exit') {
                break;
            }
        }
    }
    console.log('\nEira: Session concluded. Exiting now.');
    rl.close();
    process.exit(0); // Explicitly exit the process
}
main().catch(err => {
    console.error('\nA critical error occurred in the Eira CLI:', err);
    process.exit(1);
});

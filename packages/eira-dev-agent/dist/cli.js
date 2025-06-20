// src/cli.ts
import 'dotenv/config';
import { EiraAgent } from './agent/eiraAgent.js';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { HumanMessage, AIMessage } from '@langchain/core/messages'; // Import AIMessage
import { loadMemory, saveMemory } from './memoryUtils.js';
const memoryFilePath = 'eira_mid_term_memory.json';
async function main() {
    console.log("--- Eira Interactive CLI v1.5 (Human-in-the-Loop) ---");
    console.log("Initializing agent and loading memory...");
    const eira = EiraAgent.create();
    const rl = readline.createInterface({ input, output });
    let chatHistory = await loadMemory(memoryFilePath);
    if (chatHistory.length > 0) {
        const interactionCount = chatHistory.filter(m => m instanceof HumanMessage).length;
        console.log(`Loaded ${interactionCount} previous interactions from memory.`);
    }
    console.log("\nEira is ready. You can start the conversation. Type 'exit' to end.\n");
    let nextUserInput = await rl.question('Marius: ');
    while (nextUserInput.toLowerCase() !== 'exit') {
        console.log('Eira is thinking...');
        try {
            // The `run` method now takes the full history, not just the new input
            const finalState = await eira.run(nextUserInput, chatHistory);
            // The result from the agent run is the new, complete history
            chatHistory = finalState;
            await saveMemory(memoryFilePath, chatHistory);
            const lastMessage = chatHistory[chatHistory.length - 1];
            // *** CRITICAL CHANGE: Check for the human-in-the-loop signal ***
            if (lastMessage instanceof AIMessage &&
                lastMessage.tool_calls?.some(call => call.name === 'askHumanForHelpTool')) {
                // The agent's main content already includes the question.
                // We just need to display it and then prompt for the next input.
                const eiraResponseContent = typeof lastMessage.content === "string"
                    ? lastMessage.content.trim()
                    : JSON.stringify(lastMessage.content, null, 2);
                console.log(`\nEira: ${eiraResponseContent}\n`);
                // The loop will now prompt for the next turn.
                nextUserInput = await rl.question('Marius: ');
            }
            else {
                // This is a normal turn where the agent finished its thought.
                const eiraResponseContent = lastMessage?.content ?? "[Eira took an action without speaking]";
                console.log(`\nEira: ${eiraResponseContent}\n`);
                // Prompt for the next turn
                nextUserInput = await rl.question('Marius: ');
            }
        }
        catch (error) {
            console.error("\nError during agent execution:", error);
            nextUserInput = await rl.question("An error occurred. Please try again or type 'exit'.\nMarius: ");
        }
    }
    console.log('\nEira: Session concluded.');
    rl.close();
}
main().catch(err => {
    console.error("\nA critical error occurred in the Eira CLI:", err);
    process.exit(1);
});

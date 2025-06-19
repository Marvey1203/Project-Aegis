// src/cli.ts
// #!/usr/bin/env node
import 'dotenv/config';
import { EiraAgent } from './agent/eiraAgent.js';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { HumanMessage } from '@langchain/core/messages';
import { loadMemory, saveMemory } from './memoryUtils.js';
const memoryFilePath = 'eira_mid_term_memory.json';
async function main() {
    console.log("--- Eira Interactive CLI v1.4 (Robust Memory) ---");
    console.log("Initializing agent and loading memory...");
    const eira = EiraAgent.create();
    const rl = readline.createInterface({ input, output });
    let chatHistory = await loadMemory(memoryFilePath);
    if (chatHistory.length > 0) {
        const interactionCount = chatHistory.filter(m => m instanceof HumanMessage).length;
        console.log(`Loaded ${interactionCount} previous interactions from memory.`);
    }
    console.log("\nEira is ready. You can start the conversation. Type 'exit' to end.\n");
    while (true) {
        const userInput = await rl.question('Marius: ');
        if (userInput.toLowerCase() === 'exit') {
            console.log('\nEira: Session concluded.');
            break;
        }
        console.log('Eira is thinking...');
        try {
            // FIX: Agent now returns the full and final message history for the session.
            const finalMessages = await eira.run(userInput, chatHistory);
            // The new chat history IS the final message list from the agent.
            chatHistory = finalMessages;
            // Save the complete and valid history after each interaction.
            await saveMemory(memoryFilePath, chatHistory);
            // Display the last message to the user.
            const lastMessage = chatHistory[chatHistory.length - 1];
            const eiraResponseContent = lastMessage?.content ?? "[Eira produced no verbal response]";
            // Don't display anything if the last message was a tool call with no text.
            if (typeof eiraResponseContent === "string" && eiraResponseContent.trim() !== "") {
                console.log(`Eira: ${eiraResponseContent}\n`);
            }
            else {
                console.log(`Eira: [Took an action without speaking]\n`);
            }
        }
        catch (error) {
            console.error("\nError during agent execution:", error);
            console.log("Please try again with a different input.\n");
        }
    }
    rl.close();
}
main().catch(err => {
    console.error("\nA critical error occurred in the Eira CLI:", err);
    process.exit(1);
});

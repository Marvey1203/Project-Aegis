import 'dotenv/config';
import { EiraAgent } from './agent/eiraAgent.js';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { HumanMessage } from '@langchain/core/messages';
import { loadMemory, saveMemory } from './memoryUtils.js';
import * as fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const memoryFilePath = 'eira_mid_term_memory.json';
async function main() {
    console.log("--- Eira Interactive CLI v1.4 (Robust Memory) ---");
    console.log("Initializing agent and loading memory...");
    const memoryPath = path.resolve(__dirname, '..', memoryFilePath);
    let midTermMemoryRaw = '{}';
    try {
        const memoryData = await fs.readFile(memoryPath, 'utf-8');
        midTermMemoryRaw = memoryData;
    }
    catch (error) {
        console.warn('Could not load mid-term memory file, using empty object');
    }
    const midTermMemory = midTermMemoryRaw.length > 1000 ? midTermMemoryRaw.slice(0, 1000) + '...' : midTermMemoryRaw;
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
            const finalMessages = await eira.run(userInput, chatHistory);
            chatHistory = finalMessages;
            await saveMemory(memoryFilePath, chatHistory);
            const lastMessage = chatHistory[chatHistory.length - 1];
            if (lastMessage?.name === 'askHumanForHelpTool') {
                console.log(`\nEira needs your help: ${lastMessage.content}`);
                const userInput = await rl.question("Please type your response and press Enter: ");
                chatHistory.push(new HumanMessage(userInput));
                await saveMemory(memoryFilePath, chatHistory);
                continue;
            }
            const eiraResponseContent = lastMessage?.content ?? "[Eira produced no verbal response]";
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

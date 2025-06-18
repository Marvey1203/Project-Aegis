"use strict";
// src/cli.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// #!/usr/bin/env node
require("dotenv/config");
const eiraAgent_1 = require("./agent/eiraAgent");
const readline = __importStar(require("readline/promises"));
const process_1 = require("process");
const messages_1 = require("@langchain/core/messages");
const memoryUtils_1 = require("./memoryUtils");
const memoryFilePath = 'eira_mid_term_memory.json';
async function main() {
    console.log("--- Eira Interactive CLI v1.4 (Robust Memory) ---");
    console.log("Initializing agent and loading memory...");
    const eira = eiraAgent_1.EiraAgent.create();
    const rl = readline.createInterface({ input: process_1.stdin, output: process_1.stdout });
    let chatHistory = await (0, memoryUtils_1.loadMemory)(memoryFilePath);
    if (chatHistory.length > 0) {
        const interactionCount = chatHistory.filter(m => m instanceof messages_1.HumanMessage).length;
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
            await (0, memoryUtils_1.saveMemory)(memoryFilePath, chatHistory);
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

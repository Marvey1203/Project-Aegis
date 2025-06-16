#!/usr/bin/env node
"use strict";
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
require("dotenv/config");
const eiraAgent_1 = require("./agent/eiraAgent");
const readline = __importStar(require("readline/promises"));
const process_1 = require("process");
const messages_1 = require("@langchain/core/messages");
const memoryUtils_1 = require("./memoryUtils"); // Added import
const memoryFilePath = 'eira_mid_term_memory.json'; // Added memory file path
async function main() {
    console.log("--- Eira Interactive CLI v1.3 (Mid-Term Memory Enabled) ---"); // Version bump for clarity
    console.log("Initializing agent and loading memory...");
    const eira = eiraAgent_1.EiraAgent.create();
    const rl = readline.createInterface({ input: process_1.stdin, output: process_1.stdout });
    // Load chat history from memory
    let chatHistory = await (0, memoryUtils_1.loadMemory)(memoryFilePath); // Modified
    if (chatHistory.length > 0) {
        console.log(`Loaded ${chatHistory.length / 2} previous interactions from memory.`);
    }
    console.log("\nEira is ready. You can start the conversation. Type 'exit' to end.\n");
    while (true) {
        const userInput = await rl.question('Marius: ');
        if (userInput.toLowerCase() === 'exit') {
            console.log('\nEira: Session concluded.');
            break;
        }
        const humanMessage = new messages_1.HumanMessage(userInput);
        console.log('Eira is thinking...');
        // Agent now returns the full response object
        const agentResponseObject = await eira.run(userInput, [...chatHistory]);
        // Construct AIMessage from the response object
        // The response object structure from agentExecutor.invoke is typically { output: string, ...other_fields_like_tool_calls }
        // For AIMessage, content is the primary text, tool_calls are for any tools the AI decided to call.
        const aiMessageContent = agentResponseObject.output; // Assuming 'output' holds the textual response
        const aiMessageToolCalls = agentResponseObject.tool_calls || []; // Assuming 'tool_calls' might exist
        const aiMessage = new messages_1.AIMessage({
            content: aiMessageContent,
            tool_calls: aiMessageToolCalls.length > 0 ? aiMessageToolCalls : undefined, // Only add tool_calls if present
        });
        // Add messages to history AFTER the turn
        chatHistory.push(humanMessage);
        chatHistory.push(aiMessage);
        // Save history after each interaction
        await (0, memoryUtils_1.saveMemory)(memoryFilePath, chatHistory); // Added saveMemory call
        console.log(`Eira: ${aiMessageContent}\n`);
    }
    rl.close();
}
main().catch(err => {
    console.error("\nA critical error occurred in the Eira CLI:", err);
    process.exit(1);
});

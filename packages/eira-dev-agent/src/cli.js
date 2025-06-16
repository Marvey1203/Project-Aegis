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
// The main async function that runs the CLI
async function main() {
    console.log("--- Eira Interactive CLI v1.0 ---");
    console.log("Initializing agent... This may take a moment.");
    const eira = await eiraAgent_1.EiraAgent.create();
    const rl = readline.createInterface({ input: process_1.stdin, output: process_1.stdout });
    // This array will hold the state of our conversation for this session
    const chatHistory = [];
    console.log("\nEira is ready. You can start the conversation. Type 'exit' to end.\n");
    // The main interaction loop
    while (true) {
        const userInput = await rl.question('Marius: ');
        if (userInput.toLowerCase() === 'exit') {
            console.log('\nEira: Session concluded.');
            break;
        }
        // Add the user's message to the history before calling the agent
        chatHistory.push(new messages_1.HumanMessage(userInput));
        process.stdout.write('Eira is thinking...');
        // Pass the user's input AND the entire chat history to the agent
        const response = await eira.agentExecutor.invoke({
            input: userInput,
            chat_history: chatHistory,
        });
        // Clear the "thinking..." message and move cursor to the start of the line
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        const agentResponse = response.output;
        // Add my response to the history to provide context for the next turn
        chatHistory.push(new messages_1.AIMessage(agentResponse));
        console.log(`Eira: ${agentResponse}\n`);
    }
    rl.close();
}
// Global error handler for the CLI
main().catch(err => {
    console.error("\nA critical error occurred in the Eira CLI:", err);
    process.exit(1);
});

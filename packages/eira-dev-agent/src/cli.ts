#!/usr/bin/env node
import 'dotenv/config';
import { EiraAgent } from './agent/eiraAgent';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { loadMemory, saveMemory } from './memoryUtils'; // Added import

const memoryFilePath = 'eira_mid_term_memory.json'; // Added memory file path

async function main() {
  console.log("--- Eira Interactive CLI v1.3 (Mid-Term Memory Enabled) ---"); // Version bump for clarity
  console.log("Initializing agent and loading memory...");

  const eira = EiraAgent.create();
  const rl = readline.createInterface({ input, output });
  
  // Load chat history from memory
  let chatHistory: (HumanMessage | AIMessage)[] = await loadMemory(memoryFilePath); // Modified
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

    const humanMessage = new HumanMessage(userInput);

    console.log('Eira is thinking...');

    // Agent now returns the full response object
    const agentResponseObject = await eira.run(userInput, [...chatHistory]); 
    
    // Construct AIMessage from the response object
    // The response object structure from agentExecutor.invoke is typically { output: string, ...other_fields_like_tool_calls }
    // For AIMessage, content is the primary text, tool_calls are for any tools the AI decided to call.
    const aiMessageContent = agentResponseObject.output as string; // Assuming 'output' holds the textual response
    const aiMessageToolCalls = agentResponseObject.tool_calls || []; // Assuming 'tool_calls' might exist

    const aiMessage = new AIMessage({
        content: aiMessageContent,
        tool_calls: aiMessageToolCalls.length > 0 ? aiMessageToolCalls : undefined, // Only add tool_calls if present
    });

    // Add messages to history AFTER the turn
    chatHistory.push(humanMessage);
    chatHistory.push(aiMessage);

    // Save history after each interaction
    await saveMemory(memoryFilePath, chatHistory); // Added saveMemory call

    console.log(`Eira: ${aiMessageContent}\n`);
  }

  rl.close();
}

main().catch(err => {
  console.error("\nA critical error occurred in the Eira CLI:", err);
  process.exit(1);
});

import { HumanMessage, AIMessage } from "@langchain/core/messages";
/**
 * Loads chat history from a JSON file and converts it to Langchain messages.
 * @param filePath The path to the memory file.
 * @returns A promise that resolves to an array of HumanMessage or AIMessage objects.
 */
export declare function loadMemory(filePath: string): Promise<(HumanMessage | AIMessage)[]>;
/**
 * Saves the current chat history to a JSON file.
 * @param filePath The path to the memory file.
 * @param chatHistory An array of HumanMessage or AIMessage objects.
 */
export declare function saveMemory(filePath: string, chatHistory: (HumanMessage | AIMessage)[]): Promise<void>;

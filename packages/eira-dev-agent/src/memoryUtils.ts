
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import * as fs from "fs/promises";

// Define the structure for stored messages
interface StoredMessage {
  type: "human" | "ai";
  data: {
    content: string;
    tool_calls?: any[]; // Or a more specific type if available
    // Add other relevant fields from AIMessage/HumanMessage if needed
  };
}

interface MemoryFile {
  memory_log: StoredMessage[];
  metadata: {
    last_updated: string;
  };
}

/**
 * Loads chat history from a JSON file and converts it to Langchain messages.
 * @param filePath The path to the memory file.
 * @returns A promise that resolves to an array of HumanMessage or AIMessage objects.
 */
export async function loadMemory(filePath: string): Promise<(HumanMessage | AIMessage)[]> {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const memoryData: MemoryFile = JSON.parse(fileContent);

    if (!memoryData.memory_log) {
      return [];
    }

    return memoryData.memory_log.map((entry) => {
      if (entry.type === "human") {
        return new HumanMessage({ content: entry.data.content });
      } else {
        // For AI messages, include tool_calls if they exist
        const aiMessageData: any = { content: entry.data.content };
        if (entry.data.tool_calls && entry.data.tool_calls.length > 0) {
          aiMessageData.tool_calls = entry.data.tool_calls;
        }
        return new AIMessage(aiMessageData);
      }
    });
  } catch (error) {
    // If the file doesn't exist or is invalid, return an empty history
    // console.warn(\`Error loading memory from \${filePath}: \${error}. Returning empty history.\`);
    return [];
  }
}

/**
 * Saves the current chat history to a JSON file.
 * @param filePath The path to the memory file.
 * @param chatHistory An array of HumanMessage or AIMessage objects.
 */
export async function saveMemory(filePath: string, chatHistory: (HumanMessage | AIMessage)[]): Promise<void> {
  const memoryLog: StoredMessage[] = chatHistory.map((message) => {
    if (message._getType() === "human") {
      return {
        type: "human",
        data: { content: message.content as string },
      };
    } else { // 'ai'
      const aiMessage = message as AIMessage;
      const storedAIMessage: StoredMessage = {
        type: "ai",
        data: {
          content: aiMessage.content as string,
        },
      };
      // Check for tool_calls and add them if they exist and are not empty
      if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        storedAIMessage.data.tool_calls = aiMessage.tool_calls;
      }
      return storedAIMessage;
    }
  });

  const memoryData: MemoryFile = {
    memory_log: memoryLog,
    metadata: {
      last_updated: new Date().toISOString(),
    },
  };

  try {
    await fs.writeFile(filePath, JSON.stringify(memoryData, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error saving memory to \${filePath}: \${error}\ `);
   
  }
}

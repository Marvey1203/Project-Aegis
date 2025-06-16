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
exports.loadMemory = loadMemory;
exports.saveMemory = saveMemory;
const messages_1 = require("@langchain/core/messages");
const fs = __importStar(require("fs/promises"));
/**
 * Loads chat history from a JSON file and converts it to Langchain messages.
 * @param filePath The path to the memory file.
 * @returns A promise that resolves to an array of HumanMessage or AIMessage objects.
 */
async function loadMemory(filePath) {
    try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        const memoryData = JSON.parse(fileContent);
        if (!memoryData.memory_log) {
            return [];
        }
        return memoryData.memory_log.map((entry) => {
            if (entry.type === "human") {
                return new messages_1.HumanMessage({ content: entry.data.content });
            }
            else {
                // For AI messages, include tool_calls if they exist
                const aiMessageData = { content: entry.data.content };
                if (entry.data.tool_calls && entry.data.tool_calls.length > 0) {
                    aiMessageData.tool_calls = entry.data.tool_calls;
                }
                return new messages_1.AIMessage(aiMessageData);
            }
        });
    }
    catch (error) {
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
async function saveMemory(filePath, chatHistory) {
    const memoryLog = chatHistory.map((message) => {
        if (message._getType() === "human") {
            return {
                type: "human",
                data: { content: message.content },
            };
        }
        else { // 'ai'
            const aiMessage = message;
            const storedAIMessage = {
                type: "ai",
                data: {
                    content: aiMessage.content,
                },
            };
            // Check for tool_calls and add them if they exist and are not empty
            if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
                storedAIMessage.data.tool_calls = aiMessage.tool_calls;
            }
            return storedAIMessage;
        }
    });
    const memoryData = {
        memory_log: memoryLog,
        metadata: {
            last_updated: new Date().toISOString(),
        },
    };
    try {
        await fs.writeFile(filePath, JSON.stringify(memoryData, null, 2), "utf-8");
    }
    catch (error) {
        console.error(`Error saving memory to \${filePath}: \${error}\ `);
    }
}

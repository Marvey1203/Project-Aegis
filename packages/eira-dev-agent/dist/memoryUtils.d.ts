import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
export declare function ensureMemoryFile(filePath: string): Promise<void>;
export declare function loadMemory(filePath: string): Promise<BaseMessage[]>;
export declare function saveMemory(filePath: string, chatHistory: (HumanMessage | AIMessage)[]): Promise<void>;
export declare function loadMidTermMemory(): Record<string, any>;

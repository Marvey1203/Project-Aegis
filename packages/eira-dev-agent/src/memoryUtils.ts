import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import * as fs from "fs/promises";
import path from "path";

// Define the structure for stored messages
interface StoredMessage {
  type: "human" | "ai";
  data: {
    content: string;
    tool_calls?: any[];
  };
}

interface MemoryFile {
  memory_log: StoredMessage[];
  metadata: {
    last_updated: string;
  };
}

export async function ensureMemoryFile(filePath: string): Promise<void> {
  try {
    await fs.access(filePath);
    const data = await fs.readFile(filePath, 'utf-8');

    if (!data.trim()) {
      console.warn(`[Memory] File is empty. Resetting memory.`);
      await fs.writeFile(filePath, JSON.stringify(getEmptyMemory(), null, 2), 'utf-8');
    } else {
      try {
        JSON.parse(data);
      } catch {
        console.warn(`[Memory] Memory file is corrupted. Resetting.`);
        await backupCorruptedFile(filePath, data);
        await fs.writeFile(filePath, JSON.stringify(getEmptyMemory(), null, 2), 'utf-8');
      }
    }
  } catch {
    await fs.writeFile(filePath, JSON.stringify(getEmptyMemory(), null, 2), 'utf-8');
  }
}

function getEmptyMemory(): MemoryFile {
  return {
    memory_log: [],
    metadata: {
      last_updated: new Date().toISOString(),
    },
  };
}

async function backupCorruptedFile(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, '.json');
  const backupName = `${base}_corrupt_${Date.now()}.bak.json`;
  const backupPath = path.join(dir, backupName);
  await fs.writeFile(backupPath, content, 'utf-8');
  console.warn(`[Memory] Backed up corrupted file to: ${backupPath}`);
}

export async function loadMemory(filePath: string): Promise<BaseMessage[]> {
  await ensureMemoryFile(filePath);

  const data = await fs.readFile(filePath, 'utf-8');
  const parsed: MemoryFile = JSON.parse(data);

  return parsed.memory_log.map((msg) => {
    if (msg.type === 'human') return new HumanMessage(msg.data);
    if (msg.type === 'ai') return new AIMessage(msg.data);
    return null;
  }).filter(Boolean) as BaseMessage[];
}

export async function saveMemory(filePath: string, chatHistory: (HumanMessage | AIMessage)[]): Promise<void> {
  const memoryLog: StoredMessage[] = chatHistory
    .filter((message) => {
      const type = message._getType();
      return type === "human" || type === "ai";
    })
    .map((message) => {
      const type = message._getType() as "human" | "ai";
      const data: any = { content: message.content };

      if (type === "ai" && (message as AIMessage).tool_calls && (message as AIMessage).tool_calls!.length > 0) {
        data.tool_calls = (message as AIMessage).tool_calls;
      }

      return { type, data };
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
    console.error(`Error saving memory to ${filePath}: ${error}`);
  }
}

export function loadMidTermMemory(): Record<string, any> {
  try {
    const raw = require("../eira_mid_term_memory.json");
    return raw.memory_log || {};
  } catch {
    return {};
  }
}

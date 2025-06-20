import { HumanMessage, AIMessage } from "@langchain/core/messages";
import * as fs from "fs/promises";
import path from "path";
export async function ensureMemoryFile(filePath) {
    try {
        await fs.access(filePath);
        const data = await fs.readFile(filePath, 'utf-8');
        if (!data.trim()) {
            console.warn(`[Memory] File is empty. Resetting memory.`);
            await fs.writeFile(filePath, JSON.stringify(getEmptyMemory(), null, 2), 'utf-8');
        }
        else {
            try {
                JSON.parse(data);
            }
            catch {
                console.warn(`[Memory] Memory file is corrupted. Resetting.`);
                await backupCorruptedFile(filePath, data);
                await fs.writeFile(filePath, JSON.stringify(getEmptyMemory(), null, 2), 'utf-8');
            }
        }
    }
    catch {
        await fs.writeFile(filePath, JSON.stringify(getEmptyMemory(), null, 2), 'utf-8');
    }
}
function getEmptyMemory() {
    return {
        memory_log: [],
        metadata: {
            last_updated: new Date().toISOString(),
        },
    };
}
async function backupCorruptedFile(filePath, content) {
    const dir = path.dirname(filePath);
    const base = path.basename(filePath, '.json');
    const backupName = `${base}_corrupt_${Date.now()}.bak.json`;
    const backupPath = path.join(dir, backupName);
    await fs.writeFile(backupPath, content, 'utf-8');
    console.warn(`[Memory] Backed up corrupted file to: ${backupPath}`);
}
export async function loadMemory(filePath) {
    await ensureMemoryFile(filePath);
    const data = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.memory_log.map((msg) => {
        if (msg.type === 'human')
            return new HumanMessage(msg.data);
        if (msg.type === 'ai')
            return new AIMessage(msg.data);
        return null;
    }).filter(Boolean);
}
export async function saveMemory(filePath, chatHistory) {
    const memoryLog = chatHistory
        .filter((message) => {
        const type = message._getType();
        return type === "human" || type === "ai";
    })
        .map((message) => {
        const type = message._getType();
        const data = { content: message.content };
        if (type === "ai" && message.tool_calls && message.tool_calls.length > 0) {
            data.tool_calls = message.tool_calls;
        }
        return { type, data };
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
        console.error(`Error saving memory to ${filePath}: ${error}`);
    }
}
export function loadMidTermMemory() {
    try {
        const raw = require("../eira_mid_term_memory.json");
        return raw.memory_log || {};
    }
    catch {
        return {};
    }
}

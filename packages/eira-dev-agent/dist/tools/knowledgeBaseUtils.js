// src/tools/knowledgeBaseUtils.ts
import * as fs from 'fs/promises';
import * as path from 'path';
const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), 'eira_knowledge_base.json');
// The single, resilient function for reading the KB
export async function readKnowledgeBase() {
    try {
        const content = await fs.readFile(KNOWLEDGE_BASE_PATH, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`Knowledge base not found at ${KNOWLEDGE_BASE_PATH}. Creating a new one.`);
            return {
                activeContext: null,
                projects: [],
                knowledgeBase: [],
                userPreferences: {},
                sessionSummaries: [],
            };
        }
        throw new Error(`Error reading knowledge base: ${error.message}`);
    }
}
// The single function for writing the KB
export async function writeKnowledgeBase(kb) {
    try {
        await fs.writeFile(KNOWLEDGE_BASE_PATH, JSON.stringify(kb, null, 2), 'utf-8');
    }
    catch (error) {
        throw new Error(`Error writing knowledge base: ${error.message}`);
    }
}

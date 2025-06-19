// src/tools/readKnowledgeBaseTool.ts
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { readKnowledgeBase } from './knowledgeBaseUtils.js';
class ReadKnowledgeBaseTool extends Tool {
    name = 'readKnowledgeBaseTool';
    description = 'Reads and returns the entire content of the knowledge base file, which contains all project, sprint, and task data.';
    schema = z.object({ input: z.string().optional() }).transform(val => val.input || "");
    async _call() {
        try {
            const kb = await readKnowledgeBase();
            return JSON.stringify(kb, null, 2);
        }
        catch (error) {
            return JSON.stringify({ success: false, message: `Error in readKnowledgeBaseTool: ${error.message}` });
        }
    }
}
export const readKnowledgeBaseTool = new ReadKnowledgeBaseTool();

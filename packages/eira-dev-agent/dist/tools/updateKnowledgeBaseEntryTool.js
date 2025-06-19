// src/tools/updateKnowledgeBaseEntryTool.ts
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { readKnowledgeBase, writeKnowledgeBase } from './knowledgeBaseUtils.js';
class UpdateKnowledgeBaseEntryTool extends Tool {
    name = 'updateKnowledgeBaseEntryTool';
    description = 'Updates an existing entry in the knowledge base.';
    schema = z.object({ input: z.string().optional() }).transform(val => val.input || '');
    async _call(arg) {
        try {
            if (!arg) {
                throw new Error('No input provided.');
            }
            const { entryId, updateData } = JSON.parse(arg);
            if (!entryId || !updateData) {
                throw new Error('Missing "entryId" or "updateData" property in input.');
            }
            const kb = await readKnowledgeBase();
            const entryIndex = kb.knowledgeBase.findIndex(entry => entry.id === entryId);
            if (entryIndex === -1) {
                return `Error: Knowledge base entry with ID '${entryId}' not found.`;
            }
            const originalEntry = kb.knowledgeBase[entryIndex];
            const updatedEntry = { ...originalEntry, ...updateData, lastUpdatedAt: new Date().toISOString() };
            kb.knowledgeBase[entryIndex] = updatedEntry;
            await writeKnowledgeBase(kb);
            return `Successfully updated knowledge base entry with ID '${entryId}'.`;
        }
        catch (error) {
            return `Error updating knowledge base entry: ${error.message}`;
        }
    }
}
export const updateKnowledgeBaseEntryTool = new UpdateKnowledgeBaseEntryTool();

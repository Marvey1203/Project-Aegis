// src/tools/deleteKnowledgeBaseEntryTool.ts
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { readKnowledgeBase, writeKnowledgeBase } from './knowledgeBaseUtils.js';
class DeleteKnowledgeBaseEntryTool extends Tool {
    name = 'deleteKnowledgeBaseEntryTool';
    description = 'Deletes an existing entry from the knowledge base. Requires confirmation.';
    schema = z.object({ input: z.string().optional() }).transform(val => val.input || '');
    async _call(arg) {
        try {
            if (!arg) {
                throw new Error('No input provided.');
            }
            const { entryId, confirm } = JSON.parse(arg);
            if (!confirm) {
                return 'Deletion not confirmed. Please set the `confirm` parameter to true.';
            }
            if (!entryId) {
                throw new Error('Missing "entryId" property in input.');
            }
            const kb = await readKnowledgeBase();
            const initialLength = kb.knowledgeBase.length;
            kb.knowledgeBase = kb.knowledgeBase.filter(entry => entry.id !== entryId);
            if (kb.knowledgeBase.length === initialLength) {
                return `Error: Knowledge base entry with ID '${entryId}' not found.`;
            }
            await writeKnowledgeBase(kb);
            return `Successfully deleted knowledge base entry with ID '${entryId}'.`;
        }
        catch (error) {
            return `Error deleting knowledge base entry: ${error.message}`;
        }
    }
}
export const deleteKnowledgeBaseEntryTool = new DeleteKnowledgeBaseEntryTool();

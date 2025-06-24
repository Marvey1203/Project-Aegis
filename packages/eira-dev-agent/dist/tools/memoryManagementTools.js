// packages/eira-dev-agent/src/tools/memoryManagementTools.ts
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { storeMemory, retrieveRelevantMemories } from './chromaDBUtils.js';
export const storeMemoryTool = new DynamicStructuredTool({
    name: 'storeMemoryTool',
    description: 'Stores a piece of information, an observation, or a learning in Eira\'s long-term semantic memory.',
    schema: z.object({
        memoryContent: z.string().describe('The text content of the memory to be stored.'),
        metadata: z.object({}).passthrough().optional().describe('Optional metadata to associate with the memory, such as a task ID or file path.'),
    }),
    func: async ({ memoryContent, metadata }) => {
        try {
            const id = await storeMemory(memoryContent, metadata
                ? Object.fromEntries(Object.entries(metadata).map(([k, v]) => [k, v]))
                : undefined);
            return `Successfully stored memory with ID: ${id}.`;
        }
        catch (error) {
            return `Error storing memory: ${error.message}`;
        }
    },
});
export const retrieveRelevantMemoriesTool = new DynamicStructuredTool({
    name: 'retrieveRelevantMemoriesTool',
    description: 'Retrieves relevant memories from Eira\'s long-term semantic memory based on a query.',
    schema: z.object({
        query: z.string().describe('The natural language query to search for relevant memories.'),
    }),
    func: async ({ query }) => {
        try {
            const documents = await retrieveRelevantMemories(query);
            if (documents.length === 0) {
                return 'No relevant memories found.';
            }
            return JSON.stringify(documents, null, 2);
        }
        catch (error) {
            return `Error retrieving memories: ${error.message}`;
        }
    },
});

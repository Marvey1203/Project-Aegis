// src/tools/knowledgeBaseTools.ts
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
// Import our new centralized functions
import { readKnowledgeBase, writeKnowledgeBase } from "./knowledgeBaseUtils.js";
const addKnowledgeBaseEntrySchema = z.object({
    category: z.string().describe("The category for the new knowledge entry (e.g., 'project_structure', 'api_keys')."),
    title: z.string().describe("A concise, human-readable title for the entry."),
    content: z.any().describe("The actual information to be stored."),
    tags: z.array(z.string()).optional().describe("Optional keywords or tags."),
});
async function addKnowledgeBaseEntryLogic(input) {
    try {
        // 1. Read the KB using the resilient function
        const kbData = await readKnowledgeBase();
        const newEntryId = `kb_${Date.now()}`;
        const newEntry = {
            id: newEntryId,
            category: input.category,
            title: input.title,
            content: input.content,
            tags: input.tags || [],
            createdAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
        };
        if (!kbData.knowledgeBase) {
            kbData.knowledgeBase = [];
        }
        kbData.knowledgeBase.push(newEntry);
        // 2. Write to the KB using the centralized function
        await writeKnowledgeBase(kbData);
        return JSON.stringify({ success: true, entryId: newEntryId, message: "Knowledge base entry added successfully." });
    }
    catch (error) {
        console.error("Error in addKnowledgeBaseEntryTool:", error);
        return JSON.stringify({ success: false, entryId: null, message: `Internal tool error: ${error.message}` });
    }
}
export const addKnowledgeBaseEntryTool = new DynamicStructuredTool({
    name: "addKnowledgeBaseEntryTool",
    description: "Adds a new structured entry to the general knowledge base section.",
    schema: addKnowledgeBaseEntrySchema,
    func: addKnowledgeBaseEntryLogic,
});

"use strict";
// src/tools/knowledgeBaseTools.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.addKnowledgeBaseEntryTool = void 0;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
// Import our new centralized functions
const knowledgeBaseUtils_1 = require("./knowledgeBaseUtils");
const addKnowledgeBaseEntrySchema = zod_1.z.object({
    category: zod_1.z.string().describe("The category for the new knowledge entry (e.g., 'project_structure', 'api_keys')."),
    title: zod_1.z.string().describe("A concise, human-readable title for the entry."),
    content: zod_1.z.any().describe("The actual information to be stored."),
    tags: zod_1.z.array(zod_1.z.string()).optional().describe("Optional keywords or tags."),
});
async function addKnowledgeBaseEntryLogic(input) {
    try {
        // 1. Read the KB using the resilient function
        const kbData = await (0, knowledgeBaseUtils_1.readKnowledgeBase)();
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
        await (0, knowledgeBaseUtils_1.writeKnowledgeBase)(kbData);
        return JSON.stringify({ success: true, entryId: newEntryId, message: "Knowledge base entry added successfully." });
    }
    catch (error) {
        console.error("Error in addKnowledgeBaseEntryTool:", error);
        return JSON.stringify({ success: false, entryId: null, message: `Internal tool error: ${error.message}` });
    }
}
exports.addKnowledgeBaseEntryTool = new tools_1.DynamicStructuredTool({
    name: "addKnowledgeBaseEntryTool",
    description: "Adds a new structured entry to the general knowledge base section.",
    schema: addKnowledgeBaseEntrySchema,
    func: addKnowledgeBaseEntryLogic,
});

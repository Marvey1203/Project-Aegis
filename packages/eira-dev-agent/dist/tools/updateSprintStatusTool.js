// src/tools/updateSprintStatusTool.ts
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { readKnowledgeBase, writeKnowledgeBase } from "./knowledgeBaseUtils.js";
const UpdateSprintStatusToolSchema = z.object({
    projectId: z.string().describe("The ID of the project containing the sprint."),
    sprintId: z.string().describe("The ID of the sprint to update."),
    status: z.enum(["planned", "active", "completed", "on-hold"]).describe("The new status for the sprint."),
});
async function updateSprintStatusLogic(args) {
    try {
        const kb = await readKnowledgeBase();
        const project = kb.projects.find(p => p.projectId === args.projectId);
        if (!project) {
            return JSON.stringify({ success: false, message: `Error: Project with ID '${args.projectId}' not found.` });
        }
        const sprint = project.sprints.find(s => s.sprintId === args.sprintId);
        if (!sprint) {
            return JSON.stringify({ success: false, message: `Error: Sprint with ID '${args.sprintId}' not found in project '${args.projectId}'.` });
        }
        sprint.sprintStatus = args.status;
        await writeKnowledgeBase(kb);
        return JSON.stringify({ success: true, message: `Sprint '${sprint.sprintGoal}' in project '${project.projectName}' has been updated to '${args.status}'.` });
    }
    catch (error) {
        return JSON.stringify({ success: false, message: `Error in updateSprintStatusTool: ${error.message}` });
    }
}
export const updateSprintStatusTool = new DynamicStructuredTool({
    name: "updateSprintStatusTool",
    description: "Updates the status of a specific sprint within a project.",
    schema: UpdateSprintStatusToolSchema,
    func: updateSprintStatusLogic,
});

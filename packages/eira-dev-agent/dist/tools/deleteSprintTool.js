// src/tools/deleteSprintTool.ts
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { readKnowledgeBase, writeKnowledgeBase } from './knowledgeBaseUtils.js';
class DeleteSprintTool extends Tool {
    name = 'deleteSprintTool';
    description = 'Deletes a sprint and all of its associated tasks from a project. Requires confirmation.';
    schema = z.object({ input: z.string().optional() }).transform(val => val.input || '');
    async _call(arg) {
        try {
            if (!arg) {
                throw new Error('No input provided.');
            }
            const { projectId, sprintId, confirm } = JSON.parse(arg);
            if (!confirm) {
                return 'Deletion not confirmed. Please set the `confirm` parameter to true.';
            }
            if (!projectId || !sprintId) {
                throw new Error('Missing "projectId" or "sprintId" property in input.');
            }
            const kb = await readKnowledgeBase();
            const project = kb.projects.find(p => p.projectId === projectId);
            if (!project) {
                return `Error: Project with ID '${projectId}' not found.`;
            }
            const initialLength = project.sprints.length;
            project.sprints = project.sprints.filter(s => s.sprintId !== sprintId);
            if (project.sprints.length === initialLength) {
                return `Error: Sprint with ID '${sprintId}' not found in project '${projectId}'.`;
            }
            await writeKnowledgeBase(kb);
            return `Successfully deleted sprint with ID '${sprintId}' from project '${projectId}'.`;
        }
        catch (error) {
            return `Error deleting sprint: ${error.message}`;
        }
    }
}
export const deleteSprintTool = new DeleteSprintTool();


// src/tools/updateTaskStatusTool.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { readKnowledgeBase, writeKnowledgeBase } from "./knowledgeBaseUtils.js";

const UpdateTaskStatusToolSchema = z.object({
  projectId: z.string().describe("The ID of the project containing the sprint."),
  sprintId: z.string().describe("The ID of the sprint containing the task."),
  taskId: z.string().describe("The ID of the task to update."),
  status: z.enum(["pending", "in-progress", "completed", "blocked", "deferred"]).describe("The new status for the task."),
});

async function updateTaskStatusLogic(args: z.infer<typeof UpdateTaskStatusToolSchema>): Promise<string> {
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

    const task = sprint.tasks.find(t => t.taskId === args.taskId);

    if (!task) {
      return JSON.stringify({ success: false, message: `Error: Task with ID '${args.taskId}' not found in sprint '${args.sprintId}'.` });
    }

    task.status = args.status;
    await writeKnowledgeBase(kb);

    return JSON.stringify({ success: true, message: `Task '${task.taskDescription}' has been updated to '${args.status}'.` });
  } catch (error: any) {
    return JSON.stringify({ success: false, message: `Error in updateTaskStatusTool: ${error.message}` });
  }
}

export const updateTaskStatusTool = new DynamicStructuredTool({
  name: "updateTaskStatusTool",
  description: "Updates the status of a specific task within a sprint.",
  schema: UpdateTaskStatusToolSchema,
  func: updateTaskStatusLogic,
});

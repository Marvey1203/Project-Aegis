// src/tools/projectManagementTools.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { readKnowledgeBase, writeKnowledgeBase, Project, Sprint, Task } from "./knowledgeBaseUtils";

// --- createProjectTool ---
const CreateProjectToolSchema = z.object({
    projectName: z.string().describe("The descriptive name for the new project."),
    // FIX: projectId and projectDescription are now optional.
    projectId: z.string().optional().describe("A unique slug-like ID for the project. If not provided, it will be generated from the name."),
    projectDescription: z.string().optional().describe("A brief, optional description of the project's goals."),
    makeActiveProject: z.boolean().default(true).describe("If true, set this new project as the active context."),
});

async function createProjectLogic(args: z.infer<typeof CreateProjectToolSchema>): Promise<string> {
    try {
        const kb = await readKnowledgeBase();
        const projectId = args.projectId || args.projectName.toLowerCase().replace(/\s+/g, '_').replace(/"/g, '');

        if (kb.projects.some(p => p.projectId === projectId)) {
            return JSON.stringify({ success: false, projectId, message: `Error: Project with ID '${projectId}' already exists.` });
        }

        const newProject: Project = {
            projectId,
            projectName: args.projectName,
            projectDescription: args.projectDescription || '', // Default to empty string if not provided
            sprints: [],
            currentSprintId: null,
            keyFileLocations: [],
            projectSummary: '',
        };
        kb.projects.push(newProject);

        if (args.makeActiveProject || !kb.activeContext) {
            kb.activeContext = { projectId, sprintId: null, taskId: null };
        }

        await writeKnowledgeBase(kb);
        return JSON.stringify({ success: true, projectId, message: `Project '${args.projectName}' created successfully with ID '${projectId}'.` });
    } catch (error: any) {
        return JSON.stringify({ success: false, projectId: null, message: `Error in createProjectTool: ${error.message}` });
    }
}
export const createProjectTool = new DynamicStructuredTool({
    name: "createProjectTool",
    description: "Creates a new project in the knowledge base. This is the first step for any new initiative. Requires a project name.",
    schema: CreateProjectToolSchema,
    func: createProjectLogic,
});


// --- createSprintTool --- 
const CreateSprintToolArgsSchema = z.object({
  projectId: z.string().describe("The ID of the project to which this sprint will be added."),
  sprintGoal: z.string().describe("The main objective or goal for the new sprint."),
});

async function createSprintLogic(args: z.infer<typeof CreateSprintToolArgsSchema>): Promise<string> {
  try {
    const kb = await readKnowledgeBase();
    const project = kb.projects.find(p => p.projectId === args.projectId);
    if (!project) {
      return JSON.stringify({ success: false, sprintId: null, message: `Error: Project with ID '${args.projectId}' not found.` });
    }
    const newSprintId = `sprint_${Date.now()}`;
    const newSprint: Sprint = {
      sprintId: newSprintId,
      sprintGoal: args.sprintGoal,
      sprintStatus: "planned",
      tasks: [],
      currentTaskId: null,
    };
    project.sprints.push(newSprint);
    await writeKnowledgeBase(kb);
    return JSON.stringify({ success: true, sprintId: newSprintId, message: `Sprint '${args.sprintGoal}' created successfully in project '${args.projectId}'.` });
  } catch (error: any) {
    return JSON.stringify({ success: false, sprintId: null, message: `Error in createSprintTool: ${error.message}` });
  }
}
export const createSprintTool = new DynamicStructuredTool({
  name: "createSprintTool",
  description: "Creates a new sprint within a project.",
  schema: CreateSprintToolArgsSchema,
  func: createSprintLogic,
});

// --- createTaskTool --- 
const CreateTaskToolArgsSchema = z.object({
  projectId: z.string().describe("The ID of the project containing the sprint."),
  sprintId: z.string().describe("The ID of the sprint to which this task will be added."),
  taskDescription: z.string().describe("A clear description of what the task involves."),
});
async function createTaskLogic(args: z.infer<typeof CreateTaskToolArgsSchema>): Promise<string> {
  try {
    const kb = await readKnowledgeBase();
    const project = kb.projects.find(p => p.projectId === args.projectId);
    if (!project) {
      return JSON.stringify({ success: false, taskId: null, message: `Error: Project with ID '${args.projectId}' not found.` });
    }
    const sprint = project.sprints.find(s => s.sprintId === args.sprintId);
    if (!sprint) {
      return JSON.stringify({ success: false, taskId: null, message: `Error: Sprint with ID '${args.sprintId}' not found.` });
    }
    const newTaskId = `task_${Date.now()}`;
    const newTask: Task = {
      taskId: newTaskId,
      taskDescription: args.taskDescription,
      status: "pending",
    };
    sprint.tasks.push(newTask);
    await writeKnowledgeBase(kb);
    return JSON.stringify({ success: true, taskId: newTaskId, message: `Task '${args.taskDescription}' created successfully.` });
  } catch (error: any) {
    return JSON.stringify({ success: false, taskId: null, message: `Error in createTaskTool: ${error.message}` });
  }
}
export const createTaskTool = new DynamicStructuredTool({
  name: "createTaskTool",
  description: "Creates a new task within a sprint.",
  schema: CreateTaskToolArgsSchema,
  func: createTaskLogic,
});
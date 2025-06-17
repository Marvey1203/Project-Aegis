import * as fs from 'fs/promises';
import * as path from 'path';
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// --- BEGIN INLINED TYPE DEFINITIONS ---
// (Ideally, these would be in a central types file and imported)
interface Task {
  taskId: string;
  taskDescription: string;
  status: "pending" | "in-progress" | "completed" | "blocked" | "deferred";
  relevantFiles?: string[];
  notes?: string;
}

interface Sprint {
  sprintId: string;
  sprintGoal: string;
  sprintStatus: "planned" | "active" | "completed" | "on-hold";
  tasks: Task[];
  currentTaskId: string | null;
  sprintSummary?: string;
}

interface Project {
  projectId: string;
  projectName: string;
  projectDescription?: string;
  keyFileLocations?: string[];
  projectSummary?: string;
  currentSprintId: string | null;
  sprints: Sprint[];
}

interface ActiveContext {
  projectId: string | null;
  sprintId: string | null;
  taskId: string | null;
}

interface KnowledgeBase {
  activeContext: ActiveContext | null;
  projects: Project[];
  knowledgeBase: any[]; // Define further if used
  userPreferences: any; // Define further if used
  sessionSummaries: any[]; // Define further if used
}
// --- END INLINED TYPE DEFINITIONS ---

const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), 'eira_knowledge_base.json');

async function readKnowledgeBase(): Promise<KnowledgeBase> {
  try {
    const content = await fs.readFile(KNOWLEDGE_BASE_PATH, 'utf-8');
    return JSON.parse(content) as KnowledgeBase;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`Knowledge base file not found at ${KNOWLEDGE_BASE_PATH}. Please ensure it exists.`);
    }
    throw new Error(`Error reading knowledge base: ${error.message}`);
  }
}

async function writeKnowledgeBase(kb: KnowledgeBase): Promise<void> {
  try {
    await fs.writeFile(KNOWLEDGE_BASE_PATH, JSON.stringify(kb, null, 2), 'utf-8');
  } catch (error: any) {
    throw new Error(`Error writing knowledge base: ${error.message}`);
  }
}

// --- createSprintTool --- 
const CreateSprintToolArgsSchema = z.object({
  projectId: z.string().describe("The ID of the project to which this sprint will be added."),
  sprintGoal: z.string().describe("The main objective or goal for the new sprint."),
  sprintId: z.string().optional().describe("An optional unique identifier for the sprint. If not provided, one will be generated."),
  tasks: z.array(z.object({
    taskId: z.string().optional().describe("Optional ID for the task. If not provided, one could be generated or left for later definition."),
    taskDescription: z.string().describe("Description of the task."),
    status: z.enum(["pending", "in-progress", "completed", "blocked", "deferred"]).default("pending").describe("Status of the task."),
    relevantFiles: z.array(z.string()).optional().describe("Optional list of relevant file paths for the task."),
    notes: z.string().optional().describe("Optional notes for the task.")
  })).optional().describe("An optional list of initial task objects to populate the sprint."),
  sprintStatus: z.enum(["planned", "active", "completed", "on-hold"]).default("planned").describe("The initial status of the sprint."),
  makeActiveSprint: z.boolean().default(false).describe("If true, this new sprint will be set as the currentSprintId for the project and activeContext if applicable.")
});
type CreateSprintToolArgs = z.infer<typeof CreateSprintToolArgsSchema>;
async function createSprintLogic(args: CreateSprintToolArgs): Promise<string> {
  try {
    const kb = await readKnowledgeBase();
    const project = kb.projects.find(p => p.projectId === args.projectId);
    if (!project) {
      return JSON.stringify({
        success: false,
        sprintId: args.sprintId || null,
        message: `Error: Project with ID '${args.projectId}' not found.`
      });
    }
    let newSprintId = args.sprintId;
    if (!newSprintId) {
      newSprintId = `sprint_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    } else {
      if (project.sprints.some(s => s.sprintId === newSprintId)) {
        return JSON.stringify({
          success: false,
          sprintId: newSprintId,
          message: `Error: Sprint with ID '${newSprintId}' already exists in project '${args.projectId}'.`
        });
      }
    }
    const newTasks: Task[] = (args.tasks || []).map((taskInput, index) => ({
      taskId: taskInput.taskId || `${newSprintId}_task_${String(index + 1).padStart(3, '0')}`,
      taskDescription: taskInput.taskDescription,
      status: taskInput.status || "pending",
      relevantFiles: taskInput.relevantFiles || [],
      notes: taskInput.notes || ""
    }));
    const newSprint: Sprint = {
      sprintId: newSprintId,
      sprintGoal: args.sprintGoal,
      sprintStatus: args.sprintStatus || "planned",
      tasks: newTasks,
      currentTaskId: newTasks.length > 0 ? newTasks[0].taskId : null,
      sprintSummary: ""
    };
    project.sprints.push(newSprint);
    if (args.makeActiveSprint) {
      project.currentSprintId = newSprintId;
      if (kb.activeContext && kb.activeContext.projectId === args.projectId) {
        kb.activeContext.sprintId = newSprintId;
        kb.activeContext.taskId = newSprint.currentTaskId;
      }
    }
    await writeKnowledgeBase(kb);
    return JSON.stringify({
      success: true,
      sprintId: newSprintId,
      message: `Sprint '${newSprintId}' created successfully in project '${args.projectId}'.`
    });
  } catch (error: any) {
    return JSON.stringify({
      success: false,
      sprintId: args.sprintId || null,
      message: `Error in createSprintTool: ${error.message}`
    });
  }
}
export const createSprintTool = new DynamicStructuredTool({
  name: "createSprintTool",
  description: "Creates a new sprint within a specified project in the eira_knowledge_base.json file. Handles reading the knowledge base, adding the sprint, and writing updates.",
  schema: CreateSprintToolArgsSchema,
  func: createSprintLogic,
});

// --- createTaskTool --- 
const CreateTaskToolArgsSchema = z.object({
  projectId: z.string().describe("The ID of the project containing the sprint."),
  sprintId: z.string().describe("The ID of the sprint to which this task will be added."),
  taskDescription: z.string().describe("A clear description of what the task involves."),
  taskId: z.string().optional().describe("An optional unique identifier for the task. If not provided, one will be generated."),
  status: z.enum(["pending", "in-progress", "completed", "blocked", "deferred"]).default("pending").describe("The initial status of the task."),
  relevantFiles: z.array(z.string()).optional().default([]).describe("An optional list of relative file paths relevant to this task."),
  notes: z.string().optional().default("").describe("Optional notes or further details about the task."),
  makeActiveTask: z.boolean().default(false).describe("If true, this new task will be set as the currentTaskId for the sprint, and the root activeContext.taskId if applicable.")
});
type CreateTaskToolArgs = z.infer<typeof CreateTaskToolArgsSchema>;
async function createTaskLogic(args: CreateTaskToolArgs): Promise<string> {
  try {
    const kb = await readKnowledgeBase();
    const project = kb.projects.find(p => p.projectId === args.projectId);
    if (!project) {
      return JSON.stringify({ success: false, taskId: args.taskId || null, message: `Error: Project with ID '${args.projectId}' not found.` });
    }
    const sprint = project.sprints.find(s => s.sprintId === args.sprintId);
    if (!sprint) {
      return JSON.stringify({ success: false, taskId: args.taskId || null, message: `Error: Sprint with ID '${args.sprintId}' not found in project '${args.projectId}'.` });
    }
    let newTaskId = args.taskId;
    if (!newTaskId) {
      newTaskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    } else {
      if (sprint.tasks.some(t => t.taskId === newTaskId)) {
        return JSON.stringify({ success: false, taskId: newTaskId, message: `Error: Task with ID '${newTaskId}' already exists in sprint '${args.sprintId}'.` });
      }
    }
    const newTask: Task = {
      taskId: newTaskId,
      taskDescription: args.taskDescription,
      status: args.status || "pending",
      relevantFiles: args.relevantFiles || [],
      notes: args.notes || ""
    };
    sprint.tasks.push(newTask);
    if (args.makeActiveTask) {
      sprint.currentTaskId = newTaskId;
      if (kb.activeContext && kb.activeContext.projectId === args.projectId && kb.activeContext.sprintId === args.sprintId) {
        kb.activeContext.taskId = newTaskId;
      }
    }
    await writeKnowledgeBase(kb);
    return JSON.stringify({ success: true, taskId: newTaskId, message: `Task '${newTaskId}' created successfully in sprint '${args.sprintId}'.` });
  } catch (error: any) {
    return JSON.stringify({ success: false, taskId: args.taskId || null, message: `Error in createTaskTool: ${error.message}` });
  }
}
export const createTaskTool = new DynamicStructuredTool({
  name: "createTaskTool",
  description: "Creates a new task within a specified sprint of a specified project in the eira_knowledge_base.json file.",
  schema: CreateTaskToolArgsSchema,
  func: createTaskLogic,
});

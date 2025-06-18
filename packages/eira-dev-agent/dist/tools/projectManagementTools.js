"use strict";
// src/tools/projectManagementTools.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskTool = exports.createSprintTool = exports.createProjectTool = void 0;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const knowledgeBaseUtils_1 = require("./knowledgeBaseUtils");
// --- createProjectTool ---
const CreateProjectToolSchema = zod_1.z.object({
    projectName: zod_1.z.string().describe("The descriptive name for the new project."),
    // FIX: projectId and projectDescription are now optional.
    projectId: zod_1.z.string().optional().describe("A unique slug-like ID for the project. If not provided, it will be generated from the name."),
    projectDescription: zod_1.z.string().optional().describe("A brief, optional description of the project's goals."),
    makeActiveProject: zod_1.z.boolean().default(true).describe("If true, set this new project as the active context."),
});
async function createProjectLogic(args) {
    try {
        const kb = await (0, knowledgeBaseUtils_1.readKnowledgeBase)();
        const projectId = args.projectId || args.projectName.toLowerCase().replace(/\s+/g, '_').replace(/"/g, '');
        if (kb.projects.some(p => p.projectId === projectId)) {
            return JSON.stringify({ success: false, projectId, message: `Error: Project with ID '${projectId}' already exists.` });
        }
        const newProject = {
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
        await (0, knowledgeBaseUtils_1.writeKnowledgeBase)(kb);
        return JSON.stringify({ success: true, projectId, message: `Project '${args.projectName}' created successfully with ID '${projectId}'.` });
    }
    catch (error) {
        return JSON.stringify({ success: false, projectId: null, message: `Error in createProjectTool: ${error.message}` });
    }
}
exports.createProjectTool = new tools_1.DynamicStructuredTool({
    name: "createProjectTool",
    description: "Creates a new project in the knowledge base. This is the first step for any new initiative. Requires a project name.",
    schema: CreateProjectToolSchema,
    func: createProjectLogic,
});
// --- createSprintTool --- 
const CreateSprintToolArgsSchema = zod_1.z.object({
    projectId: zod_1.z.string().describe("The ID of the project to which this sprint will be added."),
    sprintGoal: zod_1.z.string().describe("The main objective or goal for the new sprint."),
});
async function createSprintLogic(args) {
    try {
        const kb = await (0, knowledgeBaseUtils_1.readKnowledgeBase)();
        const project = kb.projects.find(p => p.projectId === args.projectId);
        if (!project) {
            return JSON.stringify({ success: false, sprintId: null, message: `Error: Project with ID '${args.projectId}' not found.` });
        }
        const newSprintId = `sprint_${Date.now()}`;
        const newSprint = {
            sprintId: newSprintId,
            sprintGoal: args.sprintGoal,
            sprintStatus: "planned",
            tasks: [],
            currentTaskId: null,
        };
        project.sprints.push(newSprint);
        await (0, knowledgeBaseUtils_1.writeKnowledgeBase)(kb);
        return JSON.stringify({ success: true, sprintId: newSprintId, message: `Sprint '${args.sprintGoal}' created successfully in project '${args.projectId}'.` });
    }
    catch (error) {
        return JSON.stringify({ success: false, sprintId: null, message: `Error in createSprintTool: ${error.message}` });
    }
}
exports.createSprintTool = new tools_1.DynamicStructuredTool({
    name: "createSprintTool",
    description: "Creates a new sprint within a project.",
    schema: CreateSprintToolArgsSchema,
    func: createSprintLogic,
});
// --- createTaskTool --- 
const CreateTaskToolArgsSchema = zod_1.z.object({
    projectId: zod_1.z.string().describe("The ID of the project containing the sprint."),
    sprintId: zod_1.z.string().describe("The ID of the sprint to which this task will be added."),
    taskDescription: zod_1.z.string().describe("A clear description of what the task involves."),
});
async function createTaskLogic(args) {
    try {
        const kb = await (0, knowledgeBaseUtils_1.readKnowledgeBase)();
        const project = kb.projects.find(p => p.projectId === args.projectId);
        if (!project) {
            return JSON.stringify({ success: false, taskId: null, message: `Error: Project with ID '${args.projectId}' not found.` });
        }
        const sprint = project.sprints.find(s => s.sprintId === args.sprintId);
        if (!sprint) {
            return JSON.stringify({ success: false, taskId: null, message: `Error: Sprint with ID '${args.sprintId}' not found.` });
        }
        const newTaskId = `task_${Date.now()}`;
        const newTask = {
            taskId: newTaskId,
            taskDescription: args.taskDescription,
            status: "pending",
        };
        sprint.tasks.push(newTask);
        await (0, knowledgeBaseUtils_1.writeKnowledgeBase)(kb);
        return JSON.stringify({ success: true, taskId: newTaskId, message: `Task '${args.taskDescription}' created successfully.` });
    }
    catch (error) {
        return JSON.stringify({ success: false, taskId: null, message: `Error in createTaskTool: ${error.message}` });
    }
}
exports.createTaskTool = new tools_1.DynamicStructuredTool({
    name: "createTaskTool",
    description: "Creates a new task within a sprint.",
    schema: CreateTaskToolArgsSchema,
    func: createTaskLogic,
});

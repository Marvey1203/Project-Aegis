"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSprintTool = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
// --- END INLINED TYPE DEFINITIONS ---
const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), 'packages/eira-dev-agent/eira_knowledge_base.json');
async function readKnowledgeBase() {
    try {
        const content = await fs.readFile(KNOWLEDGE_BASE_PATH, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`Knowledge base file not found at ${KNOWLEDGE_BASE_PATH}. Please ensure it exists.`);
        }
        throw new Error(`Error reading knowledge base: ${error.message}`);
    }
}
async function writeKnowledgeBase(kb) {
    try {
        await fs.writeFile(KNOWLEDGE_BASE_PATH, JSON.stringify(kb, null, 2), 'utf-8');
    }
    catch (error) {
        throw new Error(`Error writing knowledge base: ${error.message}`);
    }
}
// Define Zod schema for the tool arguments
const CreateSprintToolArgsSchema = zod_1.z.object({
    projectId: zod_1.z.string().describe("The ID of the project to which this sprint will be added."),
    sprintGoal: zod_1.z.string().describe("The main objective or goal for the new sprint."),
    sprintId: zod_1.z.string().optional().describe("An optional unique identifier for the sprint. If not provided, one will be generated."),
    tasks: zod_1.z.array(zod_1.z.object({
        taskId: zod_1.z.string().optional().describe("Optional ID for the task. If not provided, one could be generated or left for later definition."),
        taskDescription: zod_1.z.string().describe("Description of the task."),
        status: zod_1.z.enum(["pending", "in-progress", "completed", "blocked", "deferred"]).default("pending").describe("Status of the task."),
        relevantFiles: zod_1.z.array(zod_1.z.string()).optional().describe("Optional list of relevant file paths for the task."),
        notes: zod_1.z.string().optional().describe("Optional notes for the task.")
    })).optional().describe("An optional list of initial task objects to populate the sprint."),
    sprintStatus: zod_1.z.enum(["planned", "active", "completed", "on-hold"]).default("planned").describe("The initial status of the sprint."),
    makeActiveSprint: zod_1.z.boolean().default(false).describe("If true, this new sprint will be set as the currentSprintId for the project and activeContext if applicable.")
});
// The core logic of the createSprintTool, now as a regular async function
async function createSprintLogic(args) {
    try {
        const kb = await readKnowledgeBase();
        const project = kb.projects.find(p => p.projectId === args.projectId);
        if (!project) {
            // Error: Project not found
            return JSON.stringify({
                success: false,
                sprintId: args.sprintId || null,
                message: `Error: Project with ID '${args.projectId}' not found.`
            });
        }
        let newSprintId = args.sprintId;
        if (!newSprintId) {
            newSprintId = `sprint_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        }
        else {
            if (project.sprints.some(s => s.sprintId === newSprintId)) {
                // Error: Sprint ID already exists
                return JSON.stringify({
                    success: false,
                    sprintId: newSprintId,
                    message: `Error: Sprint with ID '${newSprintId}' already exists in project '${args.projectId}'.`
                });
            }
        }
        const newTasks = (args.tasks || []).map((taskInput, index) => ({
            taskId: taskInput.taskId || `${newSprintId}_task_${String(index + 1).padStart(3, '0')}`,
            taskDescription: taskInput.taskDescription,
            status: taskInput.status || "pending",
            relevantFiles: taskInput.relevantFiles || [],
            notes: taskInput.notes || ""
        }));
        const newSprint = {
            sprintId: newSprintId,
            sprintGoal: args.sprintGoal,
            sprintStatus: args.sprintStatus || "planned",
            tasks: newTasks,
            currentTaskId: newTasks.length > 0 ? newTasks[0].taskId : null,
            sprintSummary: "" // Initialize with empty summary
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
        // Success
        return JSON.stringify({
            success: true,
            sprintId: newSprintId,
            message: `Sprint '${newSprintId}' created successfully in project '${args.projectId}'.`
        });
    }
    catch (error) {
        // Catch any other errors during the process
        return JSON.stringify({
            success: false,
            sprintId: args.sprintId || null,
            message: `Error in createSprintTool: ${error.message}`
        });
    }
}
// Wrap the logic in DynamicStructuredTool
exports.createSprintTool = new tools_1.DynamicStructuredTool({
    name: "createSprintTool",
    description: "Creates a new sprint within a specified project in the eira_knowledge_base.json file. Handles reading the knowledge base, adding the sprint, and writing updates.",
    schema: CreateSprintToolArgsSchema,
    func: createSprintLogic, // The actual function to execute
});
// Potential future tools like createTaskTool would go here
// export const createTaskTool = new DynamicStructuredTool({...});

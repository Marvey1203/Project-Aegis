import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
export declare const createProjectTool: DynamicStructuredTool<z.ZodObject<{
    projectName: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
    projectDescription: z.ZodOptional<z.ZodString>;
    makeActiveProject: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    projectName: string;
    makeActiveProject: boolean;
    projectId?: string | undefined;
    projectDescription?: string | undefined;
}, {
    projectName: string;
    projectId?: string | undefined;
    projectDescription?: string | undefined;
    makeActiveProject?: boolean | undefined;
}>, {
    projectName: string;
    makeActiveProject: boolean;
    projectId?: string | undefined;
    projectDescription?: string | undefined;
}, {
    projectName: string;
    projectId?: string | undefined;
    projectDescription?: string | undefined;
    makeActiveProject?: boolean | undefined;
}, string>;
export declare const createSprintTool: DynamicStructuredTool<z.ZodObject<{
    projectId: z.ZodString;
    sprintGoal: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    sprintGoal: string;
}, {
    projectId: string;
    sprintGoal: string;
}>, {
    projectId: string;
    sprintGoal: string;
}, {
    projectId: string;
    sprintGoal: string;
}, string>;
export declare const createTaskTool: DynamicStructuredTool<z.ZodObject<{
    projectId: z.ZodString;
    sprintId: z.ZodString;
    taskDescription: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    sprintId: string;
    taskDescription: string;
}, {
    projectId: string;
    sprintId: string;
    taskDescription: string;
}>, {
    projectId: string;
    sprintId: string;
    taskDescription: string;
}, {
    projectId: string;
    sprintId: string;
    taskDescription: string;
}, string>;

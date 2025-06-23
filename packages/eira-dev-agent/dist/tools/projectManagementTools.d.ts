import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
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
    tasks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    sprintGoal: string;
    tasks?: string[] | undefined;
}, {
    projectId: string;
    sprintGoal: string;
    tasks?: string[] | undefined;
}>, {
    projectId: string;
    sprintGoal: string;
    tasks?: string[] | undefined;
}, {
    projectId: string;
    sprintGoal: string;
    tasks?: string[] | undefined;
}, string>;
export declare const createTaskTool: DynamicStructuredTool<z.ZodObject<{
    projectId: z.ZodString;
    sprintId: z.ZodString;
    taskDescriptions: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    sprintId: string;
    taskDescriptions: string[];
}, {
    projectId: string;
    sprintId: string;
    taskDescriptions: string[];
}>, {
    projectId: string;
    sprintId: string;
    taskDescriptions: string[];
}, {
    projectId: string;
    sprintId: string;
    taskDescriptions: string[];
}, string>;
export declare const findNextPendingTaskTool: DynamicStructuredTool<z.ZodObject<{
    projectId: z.ZodString;
    sprintId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    sprintId: string;
}, {
    projectId: string;
    sprintId: string;
}>, {
    projectId: string;
    sprintId: string;
}, {
    projectId: string;
    sprintId: string;
}, string>;

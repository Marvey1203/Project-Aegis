import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
export declare const createSprintTool: DynamicStructuredTool<z.ZodObject<{
    projectId: z.ZodString;
    sprintGoal: z.ZodString;
    sprintId: z.ZodOptional<z.ZodString>;
    tasks: z.ZodOptional<z.ZodArray<z.ZodObject<{
        taskId: z.ZodOptional<z.ZodString>;
        taskDescription: z.ZodString;
        status: z.ZodDefault<z.ZodEnum<["pending", "in-progress", "completed", "blocked", "deferred"]>>;
        relevantFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "deferred" | "pending" | "in-progress" | "completed" | "blocked";
        taskDescription: string;
        taskId?: string | undefined;
        relevantFiles?: string[] | undefined;
        notes?: string | undefined;
    }, {
        taskDescription: string;
        status?: "deferred" | "pending" | "in-progress" | "completed" | "blocked" | undefined;
        taskId?: string | undefined;
        relevantFiles?: string[] | undefined;
        notes?: string | undefined;
    }>, "many">>;
    sprintStatus: z.ZodDefault<z.ZodEnum<["planned", "active", "completed", "on-hold"]>>;
    makeActiveSprint: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    sprintGoal: string;
    sprintStatus: "completed" | "planned" | "active" | "on-hold";
    makeActiveSprint: boolean;
    sprintId?: string | undefined;
    tasks?: {
        status: "deferred" | "pending" | "in-progress" | "completed" | "blocked";
        taskDescription: string;
        taskId?: string | undefined;
        relevantFiles?: string[] | undefined;
        notes?: string | undefined;
    }[] | undefined;
}, {
    projectId: string;
    sprintGoal: string;
    sprintId?: string | undefined;
    tasks?: {
        taskDescription: string;
        status?: "deferred" | "pending" | "in-progress" | "completed" | "blocked" | undefined;
        taskId?: string | undefined;
        relevantFiles?: string[] | undefined;
        notes?: string | undefined;
    }[] | undefined;
    sprintStatus?: "completed" | "planned" | "active" | "on-hold" | undefined;
    makeActiveSprint?: boolean | undefined;
}>, {
    projectId: string;
    sprintGoal: string;
    sprintStatus: "completed" | "planned" | "active" | "on-hold";
    makeActiveSprint: boolean;
    sprintId?: string | undefined;
    tasks?: {
        status: "deferred" | "pending" | "in-progress" | "completed" | "blocked";
        taskDescription: string;
        taskId?: string | undefined;
        relevantFiles?: string[] | undefined;
        notes?: string | undefined;
    }[] | undefined;
}, {
    projectId: string;
    sprintGoal: string;
    sprintId?: string | undefined;
    tasks?: {
        taskDescription: string;
        status?: "deferred" | "pending" | "in-progress" | "completed" | "blocked" | undefined;
        taskId?: string | undefined;
        relevantFiles?: string[] | undefined;
        notes?: string | undefined;
    }[] | undefined;
    sprintStatus?: "completed" | "planned" | "active" | "on-hold" | undefined;
    makeActiveSprint?: boolean | undefined;
}, string>;

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
export declare const updateTaskStatusTool: DynamicStructuredTool<z.ZodObject<{
    projectId: z.ZodString;
    sprintId: z.ZodString;
    taskId: z.ZodString;
    status: z.ZodEnum<["pending", "in-progress", "completed", "blocked", "deferred"]>;
}, "strip", z.ZodTypeAny, {
    status: "deferred" | "completed" | "pending" | "in-progress" | "blocked";
    projectId: string;
    sprintId: string;
    taskId: string;
}, {
    status: "deferred" | "completed" | "pending" | "in-progress" | "blocked";
    projectId: string;
    sprintId: string;
    taskId: string;
}>, {
    status: "deferred" | "completed" | "pending" | "in-progress" | "blocked";
    projectId: string;
    sprintId: string;
    taskId: string;
}, {
    status: "deferred" | "completed" | "pending" | "in-progress" | "blocked";
    projectId: string;
    sprintId: string;
    taskId: string;
}, string>;

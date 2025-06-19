import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
export declare const updateSprintStatusTool: DynamicStructuredTool<z.ZodObject<{
    projectId: z.ZodString;
    sprintId: z.ZodString;
    status: z.ZodEnum<["planned", "active", "completed", "on-hold"]>;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    sprintId: string;
    status: "planned" | "active" | "completed" | "on-hold";
}, {
    projectId: string;
    sprintId: string;
    status: "planned" | "active" | "completed" | "on-hold";
}>, {
    projectId: string;
    sprintId: string;
    status: "planned" | "active" | "completed" | "on-hold";
}, {
    projectId: string;
    sprintId: string;
    status: "planned" | "active" | "completed" | "on-hold";
}, string>;

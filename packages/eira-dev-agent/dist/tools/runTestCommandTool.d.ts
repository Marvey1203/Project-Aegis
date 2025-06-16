import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
export declare const runTestCommandTool: DynamicStructuredTool<z.ZodObject<{
    command: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    command?: string | undefined;
}, {
    command?: string | undefined;
}>, {
    command?: string | undefined;
}, {
    command?: string | undefined;
}, string>;

import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
export declare const createFileTool: DynamicStructuredTool<z.ZodObject<{
    filePath: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    filePath: string;
    content?: string | undefined;
}, {
    filePath: string;
    content?: string | undefined;
}>, {
    filePath: string;
    content?: string | undefined;
}, {
    filePath: string;
    content?: string | undefined;
}, string>;

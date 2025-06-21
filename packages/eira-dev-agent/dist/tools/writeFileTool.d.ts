import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
export declare const writeFileTool: DynamicStructuredTool<z.ZodObject<{
    filePath: z.ZodString;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    filePath: string;
}, {
    content: string;
    filePath: string;
}>, {
    content: string;
    filePath: string;
}, {
    content: string;
    filePath: string;
}, any>;

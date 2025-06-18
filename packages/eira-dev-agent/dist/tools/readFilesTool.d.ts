import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
export declare const readFilesTool: DynamicStructuredTool<z.ZodObject<{
    filePaths: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    filePaths: string[];
}, {
    filePaths: string[];
}>, {
    filePaths: string[];
}, {
    filePaths: string[];
}, any>;

import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
export declare const listFilesTool: DynamicStructuredTool<z.ZodObject<{
    directoryPath: z.ZodString;
}, "strip", z.ZodTypeAny, {
    directoryPath: string;
}, {
    directoryPath: string;
}>, {
    directoryPath: string;
}, {
    directoryPath: string;
}, string>;

import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
export declare const findAndReplaceInFileTool: DynamicStructuredTool<z.ZodObject<{
    filePath: z.ZodString;
    find: z.ZodString;
    replace: z.ZodString;
}, "strip", z.ZodTypeAny, {
    replace: string;
    find: string;
    filePath: string;
}, {
    replace: string;
    find: string;
    filePath: string;
}>, {
    replace: string;
    find: string;
    filePath: string;
}, {
    replace: string;
    find: string;
    filePath: string;
}, any>;

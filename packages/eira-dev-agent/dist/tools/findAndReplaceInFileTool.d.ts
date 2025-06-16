import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
export declare const findAndReplaceInFileTool: DynamicStructuredTool<z.ZodObject<{
    filePath: z.ZodString;
    searchString: z.ZodString;
    replacementString: z.ZodString;
    isRegex: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    regexFlags: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    filePath: string;
    searchString: string;
    replacementString: string;
    isRegex: boolean;
    regexFlags: string;
}, {
    filePath: string;
    searchString: string;
    replacementString: string;
    isRegex?: boolean | undefined;
    regexFlags?: string | undefined;
}>, {
    filePath: string;
    searchString: string;
    replacementString: string;
    isRegex: boolean;
    regexFlags: string;
}, {
    filePath: string;
    searchString: string;
    replacementString: string;
    isRegex?: boolean | undefined;
    regexFlags?: string | undefined;
}, string>;

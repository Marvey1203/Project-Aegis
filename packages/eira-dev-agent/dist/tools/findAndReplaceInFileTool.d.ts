import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
export declare const findAndReplaceInFileTool: DynamicStructuredTool<z.ZodObject<{
    filePath: z.ZodString;
    replacementString: z.ZodString;
    searchString: z.ZodOptional<z.ZodString>;
    isRegex: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    regexFlags: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    jsonPathExpression: z.ZodOptional<z.ZodString>;
    replacementValueType: z.ZodDefault<z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "object", "array"]>>>;
}, "strip", z.ZodTypeAny, {
    filePath: string;
    replacementString: string;
    isRegex: boolean;
    regexFlags: string;
    replacementValueType: "string" | "number" | "boolean" | "object" | "array";
    searchString?: string | undefined;
    jsonPathExpression?: string | undefined;
}, {
    filePath: string;
    replacementString: string;
    searchString?: string | undefined;
    isRegex?: boolean | undefined;
    regexFlags?: string | undefined;
    jsonPathExpression?: string | undefined;
    replacementValueType?: "string" | "number" | "boolean" | "object" | "array" | undefined;
}>, {
    filePath: string;
    replacementString: string;
    isRegex: boolean;
    regexFlags: string;
    replacementValueType: "string" | "number" | "boolean" | "object" | "array";
    searchString?: string | undefined;
    jsonPathExpression?: string | undefined;
}, {
    filePath: string;
    replacementString: string;
    searchString?: string | undefined;
    isRegex?: boolean | undefined;
    regexFlags?: string | undefined;
    jsonPathExpression?: string | undefined;
    replacementValueType?: "string" | "number" | "boolean" | "object" | "array" | undefined;
}, string>;

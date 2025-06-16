import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
export declare const askHumanForHelpTool: DynamicStructuredTool<z.ZodObject<{
    question: z.ZodString;
    context: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    question: string;
    context?: string | undefined;
}, {
    question: string;
    context?: string | undefined;
}>, {
    question: string;
    context?: string | undefined;
}, {
    question: string;
    context?: string | undefined;
}, string>;

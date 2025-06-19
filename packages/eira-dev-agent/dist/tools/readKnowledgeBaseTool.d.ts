import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
declare class ReadKnowledgeBaseTool extends Tool {
    name: string;
    description: string;
    schema: z.ZodEffects<z.ZodObject<{
        input: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        input?: string | undefined;
    }, {
        input?: string | undefined;
    }>, string, {
        input?: string | undefined;
    }>;
    _call(): Promise<string>;
}
export declare const readKnowledgeBaseTool: ReadKnowledgeBaseTool;
export {};

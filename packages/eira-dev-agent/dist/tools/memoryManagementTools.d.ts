import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
export declare const storeMemoryTool: DynamicStructuredTool<z.ZodObject<{
    memoryContent: z.ZodString;
    metadata: z.ZodOptional<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
}, "strip", z.ZodTypeAny, {
    memoryContent: string;
    metadata?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    memoryContent: string;
    metadata?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
}>, {
    memoryContent: string;
    metadata?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    memoryContent: string;
    metadata?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
}, string>;
export declare const retrieveRelevantMemoriesTool: DynamicStructuredTool<z.ZodObject<{
    query: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query: string;
}, {
    query: string;
}>, {
    query: string;
}, {
    query: string;
}, string>;

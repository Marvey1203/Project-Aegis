import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
export declare const addKnowledgeBaseEntryTool: DynamicStructuredTool<z.ZodObject<{
    category: z.ZodString;
    title: z.ZodString;
    content: z.ZodAny;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    category: string;
    title: string;
    content?: any;
    tags?: string[] | undefined;
}, {
    category: string;
    title: string;
    content?: any;
    tags?: string[] | undefined;
}>, {
    category: string;
    title: string;
    content?: any;
    tags?: string[] | undefined;
}, {
    category: string;
    title: string;
    content?: any;
    tags?: string[] | undefined;
}, string>;

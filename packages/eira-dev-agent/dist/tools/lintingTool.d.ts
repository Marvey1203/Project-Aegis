import { Tool } from "@langchain/core/tools";
import { z } from "zod";
declare class LintingTool extends Tool<string> {
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
    _call(input: string): Promise<string>;
}
export declare const lintingTool: LintingTool;
export {};

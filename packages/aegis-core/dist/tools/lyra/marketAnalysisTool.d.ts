import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
declare class MarketAnalysisTool extends Tool {
    name: string;
    description: string;
    schema: z.ZodEffects<z.ZodObject<{
        input: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        input?: string | undefined;
    }, {
        input?: string | undefined;
    }>, string | undefined, {
        input?: string | undefined;
    }>;
    private searchTool;
    private llm;
    protected _call(keyword: string | undefined): Promise<string>;
}
export declare const marketAnalysisTool: MarketAnalysisTool;
export {};
//# sourceMappingURL=marketAnalysisTool.d.ts.map
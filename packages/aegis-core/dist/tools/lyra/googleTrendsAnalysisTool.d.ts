import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
declare class GoogleTrendsAnalysisTool extends Tool {
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
    protected _call(keyword: string | undefined): Promise<string>;
}
export declare const googleTrendsAnalysisTool: GoogleTrendsAnalysisTool;
export {};
//# sourceMappingURL=googleTrendsAnalysisTool.d.ts.map
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
declare class FinancialCircuitBreakerTool extends Tool {
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
    protected _call(input: string): Promise<string>;
}
export declare const financialCircuitBreakerTool: FinancialCircuitBreakerTool;
export {};
//# sourceMappingURL=financialCircuitBreakerTool.d.ts.map
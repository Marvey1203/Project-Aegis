import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import 'dotenv/config';
declare class CJDropshippingApiTool extends Tool {
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
    protected _call(query: string): Promise<string>;
}
export declare const cjDropshippingApiTool: CJDropshippingApiTool;
export {};
//# sourceMappingURL=cjDropshippingApiTool.d.ts.map
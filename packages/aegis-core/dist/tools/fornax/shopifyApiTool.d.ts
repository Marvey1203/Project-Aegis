import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
declare class ShopifyCreateProductTool extends Tool {
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
declare class ShopifyGetOrdersTool extends Tool {
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
export declare const shopifyCreateProductTool: ShopifyCreateProductTool;
export declare const shopifyGetOrdersTool: ShopifyGetOrdersTool;
export {};
//# sourceMappingURL=shopifyApiTool.d.ts.map
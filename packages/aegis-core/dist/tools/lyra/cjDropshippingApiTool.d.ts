import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
declare class CJDropshippingApiTool extends Tool {
    name: string;
    description: string;
    schema: z.ZodEffects<z.ZodObject<{
        input: z.ZodOptional<z.ZodString>;
        pageSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        pageSize: number;
        input?: string | undefined;
    }, {
        input?: string | undefined;
        pageSize?: number | undefined;
    }>, string, {
        input?: string | undefined;
        pageSize?: number | undefined;
    }>;
    protected _call(arg: string): Promise<string>;
}
export declare const cjDropshippingApiTool: CJDropshippingApiTool;
declare class CjCreateOrderTool extends Tool {
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
export declare const cjCreateOrderTool: CjCreateOrderTool;
declare class CjGetOrderStatusTool extends Tool {
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
    protected _call(orderId: string): Promise<string>;
}
export declare const cjGetOrderStatusTool: CjGetOrderStatusTool;
export {};
//# sourceMappingURL=cjDropshippingApiTool.d.ts.map
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
declare class CommunicationTool extends Tool {
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
    private resend;
    constructor();
    protected _call(input: string): Promise<string>;
}
export declare const communicationTool: CommunicationTool;
export {};
//# sourceMappingURL=communicationTool.d.ts.map
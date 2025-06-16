import { z } from 'zod';
export declare const Agent: z.ZodEnum<["Janus", "Lyra", "Caelus", "Fornax", "Corvus", "Orion"]>;
export declare const TaskStatus: z.ZodEnum<["pending", "in_progress", "completed", "failed", "awaiting_human_approval"]>;
export declare const TaskSchema: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
    agent: z.ZodEnum<["Janus", "Lyra", "Caelus", "Fornax", "Corvus", "Orion"]>;
    input: z.ZodAny;
    output: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    status: z.ZodDefault<z.ZodEnum<["pending", "in_progress", "completed", "failed", "awaiting_human_approval"]>>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status?: "completed" | "failed" | "in_progress" | "pending" | "awaiting_human_approval";
    description?: string;
    input?: any;
    output?: Record<string, unknown>;
    id?: string;
    dependencies?: string[];
    agent?: "Janus" | "Lyra" | "Caelus" | "Fornax" | "Corvus" | "Orion";
}, {
    status?: "completed" | "failed" | "in_progress" | "pending" | "awaiting_human_approval";
    description?: string;
    input?: any;
    output?: Record<string, unknown>;
    id?: string;
    dependencies?: string[];
    agent?: "Janus" | "Lyra" | "Caelus" | "Fornax" | "Corvus" | "Orion";
}>;
export type Task = z.infer<typeof TaskSchema>;
export interface AgentState {
    tasks: Task[];
    systemMessages: string[];
    humanApprovalNeeded: boolean;
    product?: {
        productId: string;
        productUrl: string;
        title: string;
        description: string;
    };
}
export declare const graphState: {
    tasks: {
        value: (_: Task[], y: Task[]) => {
            status?: "completed" | "failed" | "in_progress" | "pending" | "awaiting_human_approval";
            description?: string;
            input?: any;
            output?: Record<string, unknown>;
            id?: string;
            dependencies?: string[];
            agent?: "Janus" | "Lyra" | "Caelus" | "Fornax" | "Corvus" | "Orion";
        }[];
        default: () => any[];
    };
    systemMessages: {
        value: (x: string[], y: string[]) => string[];
        default: () => any[];
    };
    humanApprovalNeeded: {
        value: (_: boolean, y: boolean) => boolean;
        default: () => boolean;
    };
    product: {
        value: (_: any, y: any) => any;
        default: () => any;
    };
};
export declare const GenerateAdCopyInputSchema: z.ZodObject<{
    productName: z.ZodString;
    productDescription: z.ZodString;
    targetPlatform: z.ZodEnum<["Facebook", "Google Ads", "Twitter", "Instagram"]>;
}, "strip", z.ZodTypeAny, {
    productName?: string;
    productDescription?: string;
    targetPlatform?: "Facebook" | "Google Ads" | "Twitter" | "Instagram";
}, {
    productName?: string;
    productDescription?: string;
    targetPlatform?: "Facebook" | "Google Ads" | "Twitter" | "Instagram";
}>;
export declare const productSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    price: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    description?: string;
    title?: string;
    price?: number;
}, {
    description?: string;
    title?: string;
    price?: number;
}>;
export declare const emailSchema: z.ZodObject<{
    to: z.ZodString;
    subject: z.ZodString;
    htmlBody: z.ZodString;
}, "strip", z.ZodTypeAny, {
    subject?: string;
    to?: string;
    htmlBody?: string;
}, {
    subject?: string;
    to?: string;
    htmlBody?: string;
}>;

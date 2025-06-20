import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
export declare const humanConfirmationTool: DynamicStructuredTool<z.ZodObject<{
    planSummary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    planSummary: string;
}, {
    planSummary: string;
}>, {
    planSummary: string;
}, {
    planSummary: string;
}, string>;

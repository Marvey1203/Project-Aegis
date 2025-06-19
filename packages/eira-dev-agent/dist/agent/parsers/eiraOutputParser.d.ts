import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
declare const agentOutputSchema: z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"final_answer">;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    type: "final_answer";
}, {
    content: string;
    type: "final_answer";
}>, z.ZodObject<{
    type: z.ZodLiteral<"tool_call">;
    tool_name: z.ZodString;
    tool_input: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    type: "tool_call";
    tool_name: string;
    tool_input: Record<string, any>;
}, {
    type: "tool_call";
    tool_name: string;
    tool_input: Record<string, any>;
}>]>;
export declare const eiraOutputParser: StructuredOutputParser<z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"final_answer">;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    type: "final_answer";
}, {
    content: string;
    type: "final_answer";
}>, z.ZodObject<{
    type: z.ZodLiteral<"tool_call">;
    tool_name: z.ZodString;
    tool_input: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    type: "tool_call";
    tool_name: string;
    tool_input: Record<string, any>;
}, {
    type: "tool_call";
    tool_name: string;
    tool_input: Record<string, any>;
}>]>>;
export type EiraParsedOutput = z.infer<typeof agentOutputSchema>;
export {};

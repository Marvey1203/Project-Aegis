import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

// Final answer schema: just a string
const finalAnswerSchema = z.object({
  type: z.literal("final_answer"),
  content: z.string(),
});

// Tool call schema
const toolCallSchema = z.object({
  type: z.literal("tool_call"),
  tool_name: z.string(),
  tool_input: z.record(z.any()),
});

// Union of both formats
const agentOutputSchema = z.union([finalAnswerSchema, toolCallSchema]);

export const eiraOutputParser = StructuredOutputParser.fromZodSchema(agentOutputSchema);

export type EiraParsedOutput = z.infer<typeof agentOutputSchema>;

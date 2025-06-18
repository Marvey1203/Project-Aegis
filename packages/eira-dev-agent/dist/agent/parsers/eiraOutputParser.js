"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eiraOutputParser = void 0;
const zod_1 = require("zod");
const output_parsers_1 = require("@langchain/core/output_parsers");
// Final answer schema: just a string
const finalAnswerSchema = zod_1.z.object({
    type: zod_1.z.literal("final_answer"),
    content: zod_1.z.string(),
});
// Tool call schema
const toolCallSchema = zod_1.z.object({
    type: zod_1.z.literal("tool_call"),
    tool_name: zod_1.z.string(),
    tool_input: zod_1.z.record(zod_1.z.any()),
});
// Union of both formats
const agentOutputSchema = zod_1.z.union([finalAnswerSchema, toolCallSchema]);
exports.eiraOutputParser = output_parsers_1.StructuredOutputParser.fromZodSchema(agentOutputSchema);

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
export declare const getCurrentDirectoryTool: DynamicStructuredTool<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>, {}, {}, string>;

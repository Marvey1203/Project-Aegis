import { DynamicTool } from "@langchain/core/tools";

export const getCurrentTimestampTool = new DynamicTool({
  name: "getCurrentTimestampTool",
  description:
    "Returns the current UTC date and time as a string, formatted according to the ISO 8601 standard (e.g., 'YYYY-MM-DDTHH:mm:ss.sssZ'). Useful for timestamping events or data entries.",
  func: async () => {
    try {
      return new Date().toISOString();
    } catch (error: any) {
      console.error("Error in getCurrentTimestampTool:", error);
      return `Error getting timestamp: ${error.message}`;
    }
  },
});
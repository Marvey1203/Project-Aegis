"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentTimestampTool = void 0;
const tools_1 = require("@langchain/core/tools");
exports.getCurrentTimestampTool = new tools_1.DynamicTool({
    name: "getCurrentTimestampTool",
    description: "Returns the current UTC date and time as a string, formatted according to the ISO 8601 standard (e.g., 'YYYY-MM-DDTHH:mm:ss.sssZ'). Useful for timestamping events or data entries.",
    func: async () => {
        try {
            return new Date().toISOString();
        }
        catch (error) {
            console.error("Error in getCurrentTimestampTool:", error);
            return `Error getting timestamp: ${error.message}`;
        }
    },
});

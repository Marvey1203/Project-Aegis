"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAndReplaceInFileTool = void 0;
const zod_1 = require("zod");
const tools_1 = require("@langchain/core/tools");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const jsonpath_plus_1 = __importDefault(require("jsonpath-plus")); // Changed import
const KNOWLEDGE_BASE_PATH = path_1.default.resolve('packages/eira-dev-agent/eira_knowledge_base.json');
async function readFileToString(filePath) {
    try {
        return await promises_1.default.readFile(filePath, 'utf-8');
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`File not found at path: ${filePath}`);
        }
        throw error;
    }
}
const findAndReplaceInFileSchema = zod_1.z.object({
    filePath: zod_1.z.string().describe("The relative path of the file to be modified (e.g., 'src/components/myComponent.tsx' or 'data.json')."),
    replacementString: zod_1.z.string().describe("In Text/Regex Mode: The string that will replace searchString. In JSONPath Mode: The string representation of the new value (its interpretation depends on replacementValueType)."),
    searchString: zod_1.z.string().optional().describe("The exact string or regex pattern to search for. Used only in Text/Regex Mode."),
    isRegex: zod_1.z.boolean().optional().default(false).describe("If true, searchString is a regex. Used only in Text/Regex Mode. Defaults to false."),
    regexFlags: zod_1.z.string().optional().default("g").describe("Regex flags (e.g., 'gi'). Used only if isRegex is true. Defaults to 'g' (global)."),
    jsonPathExpression: zod_1.z.string().optional().describe("A JSONPath expression (e.g., '$.projects[?(@.projectId==\'eira_dev_enhancement\')].sprints[0].status'). If provided, the tool operates in JSONPath Mode."),
    replacementValueType: zod_1.z.enum(['string', 'number', 'boolean', 'object', 'array']).optional().default('string').describe("Specifies the intended JSON type of replacementString in JSONPath Mode. Defaults to 'string'."),
});
exports.findAndReplaceInFileTool = new tools_1.DynamicStructuredTool({
    name: "findAndReplaceInFileTool",
    description: "Finds and replaces content in a file. Supports two modes: 1. Text/Regex Mode: Finds occurrences of a search string (or regex) and replaces them. 2. JSONPath Mode: Modifies specific elements within a JSON file targeted by a JSONPath expression, setting them to a new value of a specified type.",
    schema: findAndReplaceInFileSchema,
    func: async ({ filePath, searchString, replacementString, isRegex, regexFlags, jsonPathExpression, replacementValueType }) => {
        const R_JSONPath = jsonpath_plus_1.default; // Using 'any' to bypass potential type issues during this persistent problem
        let fileContent;
        try {
            fileContent = await readFileToString(filePath);
        }
        catch (error) {
            return JSON.stringify({ success: false, error: error.message, message: "Failed to read file." });
        }
        let newFileContent = fileContent;
        let modifications = 0;
        if (jsonPathExpression && jsonPathExpression.trim() !== '') {
            // JSONPath Mode
            try {
                let jsonData = JSON.parse(fileContent);
                let parsedReplacementValue;
                switch (replacementValueType) {
                    case 'number':
                        parsedReplacementValue = parseFloat(replacementString);
                        if (isNaN(parsedReplacementValue)) {
                            return JSON.stringify({ success: false, error: `Invalid number format for replacementString: ${replacementString}`, message: "JSONPath replacement failed." });
                        }
                        break;
                    case 'boolean':
                        if (replacementString.toLowerCase() === 'true') {
                            parsedReplacementValue = true;
                        }
                        else if (replacementString.toLowerCase() === 'false') {
                            parsedReplacementValue = false;
                        }
                        else {
                            return JSON.stringify({ success: false, error: `Invalid boolean format for replacementString: ${replacementString}. Expected 'true' or 'false'.`, message: "JSONPath replacement failed." });
                        }
                        break;
                    case 'object':
                    case 'array':
                        try {
                            parsedReplacementValue = JSON.parse(replacementString);
                        }
                        catch (e) {
                            return JSON.stringify({ success: false, error: `Invalid JSON ${replacementValueType} format for replacementString: ${e.message}`, message: "JSONPath replacement failed." });
                        }
                        break;
                    case 'string':
                    default:
                        parsedReplacementValue = replacementString;
                        break;
                }
                // Debugging logs (can be removed later)
                // console.log("--- findAndReplaceInFileTool DEBUG START ---");
                // console.log("filePath:", filePath);
                // console.log("jsonPathExpression:", jsonPathExpression);
                // console.log("parsedReplacementValue:", parsedReplacementValue);
                // console.log("typeof parsedReplacementValue:", typeof parsedReplacementValue);
                // console.log("jsonData (before modification):", JSON.stringify(jsonData, null, 2)); // Log initial jsonData
                // Use JSONPath.nodes to count potential modifications before applying
                const nodes = R_JSONPath({ json: jsonData, path: jsonPathExpression, resultType: 'all' });
                modifications = nodes.length;
                if (modifications > 0) {
                    // console.log(`--- findAndReplaceInFileTool DEBUG: Attempting to assign value at path ${jsonPathExpression} ---`);
                    // console.log(`--- findAndReplaceInFileTool DEBUG: Current value at path = ${JSON.stringify(nodes.map(n => n.value))} ---`);
                    R_JSONPath.assign(jsonData, jsonPathExpression, parsedReplacementValue);
                    newFileContent = JSON.stringify(jsonData, null, 2);
                }
                else {
                    // console.log("--- findAndReplaceInFileTool DEBUG: No nodes found for path, no assignment needed ---");
                    // No need to re-stringify if no changes
                }
                // console.log("--- findAndReplaceInFileTool DEBUG END ---");
                if (newFileContent !== fileContent) {
                    await promises_1.default.writeFile(filePath, newFileContent, 'utf-8');
                    return JSON.stringify({ success: true, modifications: modifications, message: `JSON file updated successfully. ${modifications} modification(s) made.` });
                }
                else {
                    return JSON.stringify({ success: true, modifications: 0, message: "No changes made to the JSON file (either no matching path or new value was same as old)." });
                }
            }
            catch (error) {
                // console.error("--- findAndReplaceInFileTool JSONPath ERROR ---", error);
                return JSON.stringify({ success: false, error: `Error processing JSONPath: ${error.message}`, message: "JSONPath replacement failed." });
            }
        }
        else if (searchString) {
            // Text/Regex Mode
            try {
                if (isRegex) {
                    const regex = new RegExp(searchString, regexFlags || 'g');
                    const matches = fileContent.match(regex);
                    modifications = matches ? matches.length : 0;
                    newFileContent = fileContent.replace(regex, replacementString);
                }
                else {
                    let count = 0;
                    let index = fileContent.indexOf(searchString);
                    while (index !== -1) {
                        count++;
                        index = fileContent.indexOf(searchString, index + searchString.length);
                    }
                    modifications = count;
                    newFileContent = fileContent.split(searchString).join(replacementString);
                }
                if (newFileContent !== fileContent) {
                    await promises_1.default.writeFile(filePath, newFileContent, 'utf-8');
                    return JSON.stringify({ success: true, occurrences: modifications, message: `File updated successfully. ${modifications} occurrence(s) replaced.` });
                }
                else {
                    return JSON.stringify({ success: true, occurrences: 0, message: "No changes made to the file (search string not found or replacement is identical)." });
                }
            }
            catch (error) {
                return JSON.stringify({ success: false, error: error.message, message: "Text/Regex replacement failed." });
            }
        }
        else {
            return JSON.stringify({ success: false, error: "Invalid arguments: Must provide either jsonPathExpression or searchString.", message: "Operation failed." });
        }
    },
});

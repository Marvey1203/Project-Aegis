"use strict";
// src/tools/lintingTool.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lintingTool = void 0;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_resolver_1 = require("./path-resolver");
const path_1 = __importDefault(require("path"));
const execPromise = (0, util_1.promisify)(child_process_1.exec);
async function runEslint(filePath) {
    const absolutePath = (0, path_resolver_1.resolveToolPath)(filePath);
    const command = `npx eslint "${absolutePath}" --format json`;
    try {
        const { stdout } = await execPromise(command, {
            cwd: path_1.default.dirname((0, path_resolver_1.resolveToolPath)('package.json')) // Run from project root
        });
        return stdout || "[]"; // Return empty JSON array if no output
    }
    catch (error) {
        if (error.stdout) {
            return error.stdout;
        }
        console.error(`Error executing ESLint: ${error.stderr}`);
        if (error.stderr && error.stderr.includes('command not found')) {
            return JSON.stringify({
                error: "Command 'eslint' not found.",
                message: "ESLint is not installed or not in the system's PATH. Please run 'npm install eslint' or 'yarn add eslint'."
            });
        }
        return JSON.stringify({
            error: "An unexpected error occurred while running ESLint.",
            details: error.stderr || error.message
        });
    }
}
class LintingTool extends tools_1.Tool {
    name = "lintingTool";
    description = "Runs ESLint on a specified file or directory to check for code quality and style issues. It returns a JSON string of the linting errors and warnings. An empty array '[]' means no issues were found.";
    schema = zod_1.z.object({
        input: zod_1.z.string().optional(),
    }).transform((val) => val.input || "");
    async _call(input) {
        const { filePath } = JSON.parse(input);
        if (!filePath) {
            return "Error: 'filePath' is a required parameter.";
        }
        const result = await runEslint(filePath);
        try {
            const parsed = JSON.parse(result);
            return JSON.stringify(parsed, null, 2);
        }
        catch (e) {
            return result;
        }
    }
}
exports.lintingTool = new LintingTool();

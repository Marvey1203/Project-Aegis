// src/tools/lintingTool.ts

import { Tool } from "@langchain/core/tools";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import { resolveToolPath, findProjectRoot } from "./path-resolver.js";
import path from 'path';

const execPromise = promisify(exec);

async function runEslint(filePath: string): Promise<string> {
  const absolutePath = resolveToolPath(filePath);
  const agentWorkspace = path.join(findProjectRoot(), 'packages', 'eira-dev-agent');
  const command = `npx eslint "${absolutePath}" --format json`;

  try {
    const { stdout } = await execPromise(command, {
      cwd: agentWorkspace // Run from the agent's package directory
    });
    return stdout || "[]"; // Return empty JSON array if no output
  } catch (error: any) {
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

class LintingTool extends Tool<string> {
  name = "lintingTool";
  description = "Runs ESLint on a specified file or directory to check for code quality and style issues. It returns a JSON string of the linting errors and warnings. An empty array '[]' means no issues were found.";
  schema = z.object({
    input: z.string().optional(),
  }).transform((val) => val.input || "");

  async _call(input: string): Promise<string> {
    const { filePath } = JSON.parse(input);
    if (!filePath) {
      return "Error: 'filePath' is a required parameter.";
    }
    const result = await runEslint(filePath);
    try {
        const parsed = JSON.parse(result);
        return JSON.stringify(parsed, null, 2);
    } catch (e) {
        return result;
    }
  }
}

export const lintingTool = new LintingTool();

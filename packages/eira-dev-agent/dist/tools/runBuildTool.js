// src/tools/runBuildTool.ts
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { findProjectRoot } from './path-resolver.js';
import path from 'path';
const execPromise = promisify(exec);
async function runBuild() {
    const projectRoot = findProjectRoot();
    const packagePath = path.join(projectRoot, 'packages', 'eira-dev-agent');
    const command = 'pnpm build';
    try {
        const { stdout, stderr } = await execPromise(command, {
            cwd: packagePath,
        });
        if (stderr) {
            return `Build process completed with errors:
${stderr}`;
        }
        return `Build process completed successfully:
${stdout}`;
    }
    catch (error) {
        return `Build process failed:
${error.stdout}
${error.stderr}`;
    }
}
class RunBuildTool extends Tool {
    name = 'runBuildTool';
    description = 'Runs the pnpm build command to compile the project and returns the output. This is useful for identifying TypeScript errors.';
    schema = z.object({ input: z.string().optional() }).transform(val => val.input || "");
    async _call() {
        return await runBuild();
    }
}
export const runBuildTool = new RunBuildTool();

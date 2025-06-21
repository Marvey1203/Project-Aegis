// packages/eira-dev-agent/src/tools/runPackageBuildTool.ts
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { findProjectRoot } from './path-resolver.js';

const execPromise = promisify(exec);

class RunPackageBuildTool extends Tool {
  name = 'runPackageBuildTool';
  description = 'Runs the pnpm build command for a specific package within the monorepo (e.g., "@aegis/aegis-core"). This is useful for identifying TypeScript errors in a targeted way. The input should be the name of the package.';

  // This schema correctly matches the base Tool class by making the input optional and transforming it.
  schema = z.object({
    input: z.string().optional(),
  }).transform((val) => val.input || '');

  // The _call method receives the transformed string input directly.
  async _call(packageName: string): Promise<string> {
    if (!packageName) {
      return 'Error: Package name must be provided as input.';
    }

    const projectRoot = findProjectRoot();
    // The command needs to be run from the root of the monorepo
    const command = `pnpm --filter ${packageName} build`;

    try {
      const { stdout, stderr } = await execPromise(command, {
        cwd: projectRoot,
      });
      if (stderr && !stderr.includes('WARN')) { // pnpm often uses stderr for warnings
        return `Build process for '${packageName}' completed with errors:\n${stderr}`;
      }
      return `Build process for '${packageName}' completed successfully:\n${stdout}`;
    } catch (error: any) {
      return `Build process for '${packageName}' failed:\n${error.stdout}\n${error.stderr}`;
    }
  }
}

export const runPackageBuildTool = new RunPackageBuildTool();

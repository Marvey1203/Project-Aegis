// src/tools/gitTools.ts
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
const genericSchema = z.object({ input: z.string().optional() }).transform(val => val?.input || "");
class GitStatusTool extends Tool {
    name = 'gitStatusTool';
    description = 'Checks the current status of the Git repository. Takes no input.';
    schema = genericSchema;
    async _call(input) {
        try {
            const { stdout, stderr } = await execAsync('git status');
            if (stderr) {
                return `Error executing git status: ${stderr}`;
            }
            return stdout;
        }
        catch (error) {
            return `Error executing git status: ${error.message}`;
        }
    }
}
class GitDiffTool extends Tool {
    name = 'gitDiffTool';
    description = 'Shows the changes between the working directory and the staging area. Input is a JSON string with an optional "filePath" key: e.g., \'{"filePath": "src/index.ts"}\'';
    schema = genericSchema;
    async _call(input) {
        try {
            const { filePath } = input ? JSON.parse(input) : { filePath: undefined };
            const command = filePath ? `git diff ${filePath}` : 'git diff';
            const { stdout, stderr } = await execAsync(command);
            if (stderr) {
                return `Error executing git diff: ${stderr}`;
            }
            return stdout;
        }
        catch (error) {
            if (error.stdout) {
                return error.stdout;
            }
            return `Error executing git diff: ${error.message}`;
        }
    }
}
class GitAddTool extends Tool {
    name = 'gitAddTool';
    description = 'Stages one or more files for the next commit. Input is a JSON string with a "files" key, which is an array of strings: e.g., \'{"files": ["src/index.ts", "README.md"]}\'';
    schema = genericSchema;
    async _call(input) {
        try {
            const { files } = JSON.parse(input);
            if (!files || !Array.isArray(files) || files.length === 0) {
                return 'Error: Input must be a JSON string with a non-empty "files" array.';
            }
            const command = `git add ${files.join(' ')}`;
            const { stderr } = await execAsync(command);
            if (stderr) {
                return `Error executing git add: ${stderr}`;
            }
            return `Successfully staged files: ${files.join(', ')}`;
        }
        catch (error) {
            return `Error executing git add: ${error.message}`;
        }
    }
}
class GitCommitTool extends Tool {
    name = 'gitCommitTool';
    description = 'Creates a new commit with the staged changes. Input is a JSON string with a "message" key: e.g., \'{"message": "feat: Implement new feature"}\'';
    schema = genericSchema;
    async _call(input) {
        try {
            const { message } = JSON.parse(input);
            if (!message) {
                return 'Error: Input must be a JSON string with a "message" key.';
            }
            const escapedMessage = message.replace(/"/g, '\\"');
            const command = `git commit -m "${escapedMessage}"`;
            const { stdout, stderr } = await execAsync(command);
            if (stderr) {
                return `Error executing git commit: ${stderr}`;
            }
            return `Successfully created commit: ${stdout}`;
        }
        catch (error) {
            return `Error executing git commit: ${error.message}`;
        }
    }
}
class GitCreateBranchTool extends Tool {
    name = 'gitCreateBranchTool';
    description = 'Creates a new branch from the current HEAD. Input is a JSON string with a "branchName" key: e.g., \'{"branchName": "feature/new-auth-flow"}\'';
    schema = genericSchema;
    async _call(input) {
        try {
            const { branchName } = JSON.parse(input);
            if (!branchName) {
                return 'Error: Input must be a JSON string with a "branchName" key.';
            }
            const command = `git checkout -b ${branchName}`;
            const { stderr } = await execAsync(command);
            if (stderr) {
                return `Error creating new branch: ${stderr}`;
            }
            return `Successfully created and switched to new branch: ${branchName}`;
        }
        catch (error) {
            return `Error creating new branch: ${error.message}`;
        }
    }
}
class GitPushTool extends Tool {
    name = 'gitPushTool';
    description = 'Pushes the current branch to the remote repository. Takes no input.';
    schema = genericSchema;
    async _call(input) {
        try {
            const { stdout, stderr } = await execAsync('git push');
            if (stderr && (stderr.toLowerCase().includes('error') || stderr.toLowerCase().includes('fatal'))) {
                return `Error executing git push: ${stderr}`;
            }
            return `Successfully pushed branch to remote. Output: ${stdout} ${stderr}`;
        }
        catch (error) {
            return `Error executing git push: ${error.message}`;
        }
    }
}
export const gitStatusTool = new GitStatusTool();
export const gitDiffTool = new GitDiffTool();
export const gitAddTool = new GitAddTool();
export const gitCommitTool = new GitCommitTool();
export const gitCreateBranchTool = new GitCreateBranchTool();
export const gitPushTool = new GitPushTool();

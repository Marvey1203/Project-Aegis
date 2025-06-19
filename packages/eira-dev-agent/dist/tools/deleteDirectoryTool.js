// src/tools/deleteDirectoryTool.ts
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import fs from 'fs/promises';
import { resolveToolPath } from './path-resolver.js';
class DeleteDirectoryTool extends Tool {
    name = 'deleteDirectoryTool';
    description = 'Deletes a specified directory and all of its contents. For safety, this tool requires explicit confirmation.';
    schema = z.object({ input: z.string().optional() }).transform(val => val.input || '');
    async _call(arg) {
        try {
            if (!arg) {
                throw new Error('No input provided.');
            }
            const { directoryPath, confirm } = JSON.parse(arg);
            if (!confirm) {
                return 'Deletion not confirmed. Please set the `confirm` parameter to true.';
            }
            if (!directoryPath) {
                throw new Error('Missing "directoryPath" property in input.');
            }
            const absolutePath = resolveToolPath(directoryPath);
            await fs.rm(absolutePath, { recursive: true, force: true });
            return `Successfully deleted directory: ${directoryPath}`;
        }
        catch (error) {
            return `Error deleting directory: ${error.message}`;
        }
    }
}
export const deleteDirectoryTool = new DeleteDirectoryTool();

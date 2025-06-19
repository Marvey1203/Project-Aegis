// src/tools/deleteFileTool.ts
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import fs from 'fs/promises';
import { resolveToolPath } from './path-resolver.js';
class DeleteFileTool extends Tool {
    name = 'deleteFileTool';
    description = 'Deletes a specified file. For safety, this tool requires explicit confirmation.';
    schema = z.object({ input: z.string().optional() }).transform(val => val.input || "");
    async _call(input) {
        const { filePath, confirm } = JSON.parse(input);
        if (!confirm) {
            return 'Deletion not confirmed. Please set the `confirm` parameter to true.';
        }
        try {
            const absolutePath = resolveToolPath(filePath);
            await fs.unlink(absolutePath);
            return `Successfully deleted file: ${filePath}`;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return `Error: File not found at ${filePath}`;
            }
            return `Error deleting file: ${error.message}`;
        }
    }
}
export const deleteFileTool = new DeleteFileTool();

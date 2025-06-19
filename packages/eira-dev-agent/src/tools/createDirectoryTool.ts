
// src/tools/createDirectoryTool.ts

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import fs from 'fs/promises';
import { resolveToolPath } from './path-resolver.js';

class CreateDirectoryTool extends Tool {
  name = 'createDirectoryTool';
  description = 'Creates a new directory at the specified path. It can create nested directories.';
  
  schema = z.object({ input: z.string().optional() }).transform(val => val.input || '');

  async _call(arg: string | undefined): Promise<string> {
    try {
      if (!arg) {
        throw new Error('No input provided.');
      }
      const { directoryPath } = JSON.parse(arg);

      if (!directoryPath) {
        throw new Error('Missing "directoryPath" property in input.');
      }

      const absolutePath = resolveToolPath(directoryPath);
      await fs.mkdir(absolutePath, { recursive: true });
      return `Successfully created directory: ${directoryPath}`;
    } catch (error: any) {
      return `Error creating directory: ${error.message}`;
    }
  }
}

export const createDirectoryTool = new CreateDirectoryTool();

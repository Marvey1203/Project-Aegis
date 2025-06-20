// src/tools/queryLocalDocsTool.ts
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { findProjectRoot } from './path-resolver.js';
class QueryLocalDocsTool extends Tool {
    name = 'queryLocalDocsTool';
    description = 'Queries the local documentation files for a specific string.';
    schema = z.object({ input: z.string().optional() }).transform(val => val.input || '');
    async _call(arg) {
        try {
            if (!arg) {
                throw new Error('No input provided.');
            }
            const { query } = JSON.parse(arg);
            if (!query) {
                throw new Error('Missing "query" property in input.');
            }
            const projectRoot = findProjectRoot();
            const docsDir = path.join(projectRoot, 'packages', 'eira-dev-agent', 'documentation');
            const files = await fs.readdir(docsDir);
            const results = [];
            for (const file of files) {
                if (file.endsWith('.txt')) {
                    const content = await fs.readFile(path.join(docsDir, file), 'utf-8');
                    const lines = content.split('\n');
                    for (const line of lines) {
                        if (line.includes(query)) {
                            results.push(line);
                        }
                    }
                }
            }
            if (results.length === 0) {
                return `No results found for query: '${query}'`;
            }
            return results.join('\n');
        }
        catch (error) {
            return `Error querying local docs: ${error.message}`;
        }
    }
}
export const queryLocalDocsTool = new QueryLocalDocsTool();

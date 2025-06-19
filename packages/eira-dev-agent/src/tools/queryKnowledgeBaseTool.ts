// src/tools/queryKnowledgeBaseTool.ts

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { readKnowledgeBase } from './knowledgeBaseUtils.js';
import { JSONPath } from 'jsonpath-plus';

class QueryKnowledgeBaseTool extends Tool {
  name = 'queryKnowledgeBaseTool';
  description = 'Performs a targeted JSONPath query against the knowledge base and returns the results.';
  
  schema = z.object({ input: z.string().optional() }).transform(val => val.input || "");

  async _call(arg: string | undefined): Promise<string> {
    let query: string;
    try {
      if (!arg) {
        throw new Error('No input provided.');
      }
      // Parse the input string as JSON to extract the query property
      const input = JSON.parse(arg);
      if (!input.query) {
        throw new Error('Missing "query" property in input.');
      }
      query = input.query;
      const kb = await readKnowledgeBase();
      const results = JSONPath({ path: query, json: kb });
      return JSON.stringify(results, null, 2);
    } catch (error: any) {
      return `Error querying knowledge base: ${error.message}`;
    }
  }
}

export const queryKnowledgeBaseTool = new QueryKnowledgeBaseTool();

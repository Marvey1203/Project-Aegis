
// src/tools/reviewMyKnowledgeBaseTool.ts

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { readKnowledgeBase } from './knowledgeBaseUtils.js';
import { JSONPath } from 'jsonpath-plus';

class ReviewMyKnowledgeBaseTool extends Tool {
  name = 'reviewMyKnowledgeBaseTool';
  description = 'Reviews the knowledge base for entries matching a specific query across title, category, and content. This is used for internal process review and learning.';
  
  schema = z.object({ input: z.string().optional() }).transform(val => val.input || '');

  async _call(arg: string | undefined): Promise<string> {
    try {
      if (!arg) {
        throw new Error('No input provided.');
      }
      const { query } = JSON.parse(arg);

      if (!query) {
        throw new Error('Missing "query" property in input.');
      }

      const kb = await readKnowledgeBase();
      const results = JSONPath({ path: `$.knowledgeBase[?(@.title.includes('${query}') || @.category.includes('${query}') || @.content.includes('${query}'))]`, json: kb });
      
      if (results.length === 0) {
        return `No knowledge base entries found matching the query: '${query}'`;
      }

      return JSON.stringify(results, null, 2);
    } catch (error: any) {
      return `Error reviewing knowledge base: ${error.message}`;
    }
  }
}

export const reviewMyKnowledgeBaseTool = new ReviewMyKnowledgeBaseTool();

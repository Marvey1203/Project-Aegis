
// src/tools/ingestDocumentationTool.ts

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { basicPuppeteerScrapeTool } from './scrapingTools.js';
import { writeFileTool } from './writeFileTool.js';

class IngestDocumentationTool extends Tool {
  name = 'ingestDocumentationTool';
  description = 'Ingests documentation from a URL and saves it to a local file.';
  
  schema = z.object({ input: z.string().optional() }).transform(val => val.input || '');

  async _call(arg: string | undefined): Promise<string> {
    try {
      if (!arg) {
        throw new Error('No input provided.');
      }
      const { url, filePath } = JSON.parse(arg);

      if (!url || !filePath) {
        throw new Error('Missing "url" or "filePath" property in input.');
      }

      const scrapedResult = await basicPuppeteerScrapeTool.invoke({ url });

      // Type guard to ensure the scraped result is a string before writing.
      if (typeof scrapedResult !== 'string') {
        const errorMessage = JSON.stringify(scrapedResult, null, 2);
        throw new Error(`Scraping failed. The scrape tool returned an unexpected result: ${errorMessage}`);
      }

      const content = JSON.parse(scrapedResult).extractedText;
      
      console.log('--- CONTENT TO BE WRITTEN ---');
      console.log(content);
      console.log('--- END CONTENT ---');

      // Correctly call writeFileTool with direct arguments
      await writeFileTool.invoke({ filePath, content });

      return `Successfully ingested documentation from ${url} and saved it to ${filePath}`;
    } catch (error: any) {
      return `Error ingesting documentation: ${error.message}`;
    }
  }
}

export const ingestDocumentationTool = new IngestDocumentationTool();
